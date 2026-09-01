<?php

declare(strict_types=1);

// A dependency-free test runner: shared hosting has no composer step, and the
// rules under test are pure, so a harness would cost more than it gives.

require __DIR__ . '/../src/Auth.php';

use Snapn\V2\Auth;

$failures = [];
$passed = 0;

function check(string $name, bool $condition, string $detail = ''): void
{
    global $failures, $passed;
    if ($condition) {
        $passed++;
        return;
    }
    $failures[] = $name . ($detail !== '' ? " — {$detail}" : '');
}

// --- email -----------------------------------------------------------------
check('email is lowercased and trimmed', Auth::normalizeEmail('  Player@Example.COM ') === 'player@example.com');
check('an address is recognised', Auth::isEmailShaped('a@b.co'));
check('a non-address is refused', !Auth::isEmailShaped('nope') && !Auth::isEmailShaped('a@b') && !Auth::isEmailShaped('a b@c.com'));
check('an empty address is refused', !Auth::isEmailShaped('') && !Auth::isEmailShaped('   '));
check('an absurdly long address is refused', !Auth::isEmailShaped(str_repeat('a', 200) . '@b.co'));

// --- password --------------------------------------------------------------
check('a short password is refused', !Auth::isPasswordAcceptable('short'));
check('an eight character password is accepted', Auth::isPasswordAcceptable('12345678'));
check('spaces count toward length', Auth::isPasswordAcceptable('        '));
check('past bcrypt 72-byte truncation is refused, not silently cut', !Auth::isPasswordAcceptable(str_repeat('a', 73)));

$hash = Auth::hashPassword('correct horse battery');
check('a hash verifies its own password', password_verify('correct horse battery', $hash));
check('a hash rejects another password', !password_verify('wrong horse battery', $hash));
check('two hashes of one password differ (salted)', Auth::hashPassword('same') !== Auth::hashPassword('same'));
check('a current hash needs no rehash', !Auth::passwordNeedsUpgrade($hash));
check('a weaker hash is flagged for rehash', Auth::passwordNeedsUpgrade(password_hash('x', PASSWORD_BCRYPT, ['cost' => 4])));

// --- tokens ----------------------------------------------------------------
$token = Auth::newSessionToken();
check('a token is long enough to resist guessing', strlen($token) >= 40, 'len ' . strlen($token));
check('a token is url-safe', preg_match('/^[A-Za-z0-9_-]+$/', $token) === 1, $token);
check('two tokens differ', Auth::newSessionToken() !== Auth::newSessionToken());
check('a token hash is sha-256', strlen(Auth::hashToken($token)) === 64);
check('the same token hashes the same way', Auth::hashToken('abc') === Auth::hashToken('abc'));
check('the hash is not the token', Auth::hashToken($token) !== $token);

// --- age and account state -------------------------------------------------
check('age is whole years', Auth::ageOn('2010-09-02', '2026-09-01') === 15);
check('a birthday today counts', Auth::ageOn('2010-09-01', '2026-09-01') === 16);
check('a future birth date is not an age', Auth::ageOn('2030-01-01', '2026-09-01') === null);
check('a malformed birth date is not an age', Auth::ageOn('not-a-date', '2026-09-01') === null);

check('a 13-year-old waits for a guardian', Auth::initialAccountState('2013-01-01', '2026-09-01') === 'PENDING_GUARDIAN_CONSENT');
check('a 14-year-old may hold a session', Auth::initialAccountState('2012-01-01', '2026-09-01') === 'ACTIVE');
check('an adult may hold a session', Auth::initialAccountState('1990-01-01', '2026-09-01') === 'ACTIVE');
check('an unreadable birth date waits, rather than assuming adult', Auth::initialAccountState('garbage', '2026-09-01') === 'PENDING_GUARDIAN_CONSENT');
check('no birth date given stays active', Auth::initialAccountState(null, '2026-09-01') === 'ACTIVE');

check('under 18 is a minor', Auth::isMinor('2010-01-01', '2026-09-01'));
check('18 and over is not', !Auth::isMinor('2008-01-01', '2026-09-01'));

// --- what may be chosen at sign-up ----------------------------------------
check('player may be chosen', Auth::isSelfSelectableAccountType('PLAYER'));
check('manager may be chosen', Auth::isSelfSelectableAccountType('MANAGER'));
check('guardian may not be chosen', !Auth::isSelfSelectableAccountType('GUARDIAN'));
check('admin may not be chosen', !Auth::isSelfSelectableAccountType('ADMIN'));

// --- sessions --------------------------------------------------------------
check('an active account may hold a session', Auth::mayHoldSession('ACTIVE'));
check('a suspended account may not', !Auth::mayHoldSession('SUSPENDED'));
check('an account awaiting a guardian may not', !Auth::mayHoldSession('PENDING_GUARDIAN_CONSENT'));

check('expiry follows the lifetime', Auth::sessionExpiry('2026-09-01 00:00:00') === '2026-09-15 00:00:00');
check('a live session is usable', Auth::isSessionUsable(null, '2026-09-15 00:00:00', '2026-09-01 00:00:00'));
check('an expired session is not', !Auth::isSessionUsable(null, '2026-08-01 00:00:00', '2026-09-01 00:00:00'));
check('a revoked session is not, even before expiry', !Auth::isSessionUsable('2026-09-01 00:00:00', '2026-09-15 00:00:00', '2026-09-01 00:00:00'));

// --- rate limiting ---------------------------------------------------------
check('a few failures are allowed', !Auth::isRateLimited(3, 3));
check('too many for one address is limited', Auth::isRateLimited(Auth::MAX_ATTEMPTS_PER_EMAIL, 0));
check('too many from one client is limited', Auth::isRateLimited(0, Auth::MAX_ATTEMPTS_PER_CLIENT));
check('a client cannot lock everyone out cheaply', Auth::MAX_ATTEMPTS_PER_CLIENT > Auth::MAX_ATTEMPTS_PER_EMAIL);
check('a client address is only kept hashed', strlen(Auth::hashClient('203.0.113.9')) === 64 && Auth::hashClient('203.0.113.9') !== '203.0.113.9');

// --- report ----------------------------------------------------------------
$total = $passed + count($failures);
foreach ($failures as $failure) {
    fwrite(STDERR, "FAIL {$failure}\n");
}
echo "{$passed}/{$total} auth rule checks passed\n";
exit(count($failures) === 0 ? 0 : 1);
