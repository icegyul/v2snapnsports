<?php

declare(strict_types=1);

namespace Snapn\V2;

use DateTimeImmutable;

/**
 * Authentication rules, kept free of database and HTTP so they can be tested
 * directly. Everything here is a decision; the endpoints do the I/O.
 *
 * Nothing here needs mbstring, sodium, or any extension beyond core PHP, so
 * the rules can be exercised anywhere PHP runs — not only on the host.
 */
final class Auth
{
    /** Sessions are short-lived and refreshed on use, so a stolen token ages out. */
    public const SESSION_LIFETIME_SECONDS = 60 * 60 * 24 * 14;

    /** Cheap enough for shared hosting under a 30s limit, dear enough to matter. */
    public const BCRYPT_COST = 11;

    public const MIN_PASSWORD_LENGTH = 8;

    /** Bcrypt silently ignores bytes past 72; refuse rather than quietly truncate. */
    public const MAX_PASSWORD_BYTES = 72;

    /** Under this age an account waits for a guardian before it may hold a session. */
    public const GUARDIAN_CONSENT_AGE = 14;

    public const MINOR_AGE = 18;

    /** Failed sign-ins allowed for one address, and for one client, per window. */
    public const MAX_ATTEMPTS_PER_EMAIL = 8;
    public const MAX_ATTEMPTS_PER_CLIENT = 20;
    public const ATTEMPT_WINDOW_SECONDS = 900;

    /**
     * ASCII lowercasing is the correct rule: address case-insensitivity is only
     * defined for ASCII, and domains reach the wire as punycode.
     */
    public static function normalizeEmail(string $email): string
    {
        return \strtolower(\trim($email));
    }

    /** Deliberately loose: the server owns whether an address exists. */
    public static function isEmailShaped(string $email): bool
    {
        $email = \trim($email);

        // Byte length, deliberately: at most 190 bytes can never overflow the
        // VARCHAR(190) character column.
        if ($email === '' || \strlen($email) > 190) {
            return false;
        }

        return (bool) \preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u', $email);
    }

    /** Never trimmed: leading and trailing spaces are part of a password. */
    public static function isPasswordAcceptable(string $password): bool
    {
        $length = \strlen($password);

        return $length >= self::MIN_PASSWORD_LENGTH && $length <= self::MAX_PASSWORD_BYTES;
    }

    public static function hashPassword(string $password): string
    {
        return \password_hash($password, PASSWORD_BCRYPT, ['cost' => self::BCRYPT_COST]);
    }

    /** Lets a cost or algorithm change migrate people transparently on sign-in. */
    public static function passwordNeedsUpgrade(string $hash): bool
    {
        return \password_needs_rehash($hash, PASSWORD_BCRYPT, ['cost' => self::BCRYPT_COST]);
    }

    /** 256 bits from the system CSPRNG, url-safe so it survives a header or cookie. */
    public static function newSessionToken(): string
    {
        return \rtrim(\strtr(\base64_encode(\random_bytes(32)), '+/', '-_'), '=');
    }

    /** Only the hash is stored, so a database read cannot impersonate anyone. */
    public static function hashToken(string $token): string
    {
        return \hash('sha256', $token);
    }

    public static function ageOn(string $birthDate, string $today): ?int
    {
        $birth = DateTimeImmutable::createFromFormat('!Y-m-d', $birthDate);
        $now = DateTimeImmutable::createFromFormat('!Y-m-d', $today);
        if ($birth === false || $now === false || $birth > $now) {
            return null;
        }

        return (int) $birth->diff($now)->y;
    }

    /**
     * The state a new account starts in. A young minor holds an account but
     * gets no session until a guardian confirms; an unreadable birth date is
     * treated as the younger case, because the other guess is the harmful one.
     */
    public static function initialAccountState(?string $birthDate, string $today): string
    {
        if ($birthDate === null) {
            return 'ACTIVE';
        }

        $age = self::ageOn($birthDate, $today);
        if ($age === null) {
            return 'PENDING_GUARDIAN_CONSENT';
        }

        return $age < self::GUARDIAN_CONSENT_AGE ? 'PENDING_GUARDIAN_CONSENT' : 'ACTIVE';
    }

    public static function isMinor(?string $birthDate, string $today): bool
    {
        if ($birthDate === null) {
            return false;
        }

        $age = self::ageOn($birthDate, $today);

        return $age === null ? true : $age < self::MINOR_AGE;
    }

    /** Only these may be chosen at sign-up. A guardian arrives by invitation. */
    public static function isSelfSelectableAccountType(string $accountType): bool
    {
        return $accountType === 'PLAYER' || $accountType === 'MANAGER';
    }

    /** Whether a state may hold a session at all. */
    public static function mayHoldSession(string $accountState): bool
    {
        return $accountState === 'ACTIVE';
    }

    public static function isRateLimited(int $emailAttempts, int $clientAttempts): bool
    {
        return $emailAttempts >= self::MAX_ATTEMPTS_PER_EMAIL
            || $clientAttempts >= self::MAX_ATTEMPTS_PER_CLIENT;
    }

    /** A client address is only ever kept hashed; it is a control, not a log. */
    public static function hashClient(string $clientAddress): string
    {
        return \hash('sha256', $clientAddress);
    }

    public static function sessionExpiry(string $issuedAt): string
    {
        $issued = new DateTimeImmutable($issuedAt);

        return $issued->modify('+' . self::SESSION_LIFETIME_SECONDS . ' seconds')->format('Y-m-d H:i:s');
    }

    public static function isSessionUsable(?string $revokedAt, string $expiresAt, string $now): bool
    {
        if ($revokedAt !== null) {
            return false;
        }

        return new DateTimeImmutable($expiresAt) > new DateTimeImmutable($now);
    }
}
