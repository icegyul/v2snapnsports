# API·비밀번호·인증정보 위치 안내

## 1. 보안 원칙

이 패키지에는 실제 API key, DB password, SFTP password, private key, access token 값을 넣지 않는다. 사용자는 값 복사를 요구한 것이 아니라 Claude Code가 값을 어디서 찾아야 하는지 별도 문서화를 요구했다.

현재 source scan에서 발견된 credential 파일:

```text
.env.example
```

실제 `.env`, `.env.local`, `.pem`, `.key`, `.p12`, `.pfx`는 현재 Stadium 개발본과 통합 checkout source에서 발견되지 않았다.

## 2. V2 frontend API base

위치:

```text
.env.example
apps/web/src/api/client.ts
```

현재 선언된 변수 이름:

```text
VITE_API_BASE
```

`.env.example`의 값은 비어 있다. 승인된 V2 API endpoint가 아직 source-of-truth로 연결되지 않았기 때문이다.

실제 값을 찾는 순서:

1. 배포 환경의 environment variable 관리 화면
2. 사용자가 관리하는 password manager 또는 secure note
3. 기존 배포 host의 frontend environment 설정
4. 없으면 사용자에게 직접 승인된 endpoint를 요청

임의로 legacy URL이나 localhost를 production 값으로 쓰지 않는다.

## 3. Claude / Anthropic API

현재 실행 host의 environment에는 값이 아니라 변수 이름 `ANTHROPIC_API_KEY`가 존재한다는 점만 확인했다.

Claude Code에서 찾는 위치:

```text
현재 shell environment의 ANTHROPIC_API_KEY
사용자 shell profile에서 export하는 secure loader
macOS Keychain 또는 사용자의 password manager
Claude Code 로그인/credential store
```

값을 확인하거나 문서에 복사하지 않는다. 존재 여부만 확인하려면:

```bash
test -n "${ANTHROPIC_API_KEY:-}" && echo SET || echo UNSET
```

## 4. Git / SSH

Repository remote:

```text
git@github.com:icegyul/v2snapnsports.git
```

현재 host는 `SSH_AUTH_SOCK`을 사용한다. private key 파일 경로를 source에 넣지 않는다.

찾는 위치:

```text
ssh-agent에 로드된 key
~/.ssh/config의 Host 설정
macOS Keychain에 등록된 SSH passphrase
GitHub 계정 Settings → SSH and GPG keys
```

안전한 확인:

```bash
ssh-add -l
git remote -v
```

private key 내용이나 passphrase를 출력하지 않는다.

## 5. GitHub Actions secrets

현재 `.github/workflows/*.yml`에서 `${{ secrets.* }}` 직접 참조 이름은 발견되지 않았다.

필요해질 경우 찾는 위치:

```text
GitHub repository
→ Settings
→ Secrets and variables
→ Actions
```

새 secret을 만들기 전 workflow에서 요구하는 정확한 변수 이름을 먼저 정의하고 사용자 승인을 받는다.

## 6. Legacy API / DB / Auth 조사 문서

현재 source에서 실제 값 대신 구조와 위치를 설명하는 문서:

```text
docs/audit/LEGACY_EXTERNAL_API_MAP.md
docs/audit/LEGACY_DB_MAP.md
docs/audit/LEGACY_AUTH_MAP.md
docs/audit/LEGACY_DEPLOYMENT_MAP.md
docs/audit/MASTER_GAP_ANALYSIS_v2.md
docs/audit-live/PROD_DB_INVENTORY.md
docs/audit-live/AUTH_CURRENT_RUNTIME_FLOW.md
docs/audit-live/JWT_SECURITY_GAP_REPORT.md
docs/audit-live/V2_DEPLOYMENT_TARGET.md
```

이 문서들은 credential 값이 아니라 운영 구조와 미확인 gate를 설명한다.

## 7. Cafe24 / SFTP / DB password

현재 V2 repository에 SFTP/DB password가 없다.

찾아야 하는 외부 위치:

```text
Cafe24 호스팅 관리자
→ FTP/SFTP 계정 관리
→ DB 관리
→ PHP/API 배포 경로

사용자의 password manager
기존 운영 담당자의 secure handoff
승인된 로컬 Keychain item
```

Claude Code는 credential이 없으면 다음 상태로 보고한다.

```text
BLOCKED_CREDENTIAL_NOT_PROVIDED
```

credential을 추측하거나 source에 평문 저장하지 않는다.

## 8. 운영 DB / JWT / OAuth

현재 V2 backend는 실제 운영 credential 연결이 완료되지 않았다. 다음 값을 임의로 만들면 안 된다.

```text
DATABASE_URL
DB_HOST / DB_USER / DB_PASSWORD
JWT_SECRET / JWT_PRIVATE_KEY
OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET
MEDIA_STORAGE_KEY
```

필요한 경우 canonical OpenAPI와 deployment runbook을 읽고, 사용자에게 실제 운영 시스템의 secret manager 위치를 확인한다.

## 9. 값 없이 변수 이름만 감사하는 명령

```bash
env | cut -d= -f1 | sort
find . -maxdepth 3 -name '.env*' -print
rg -o 'import.meta.env.[A-Z0-9_]+' apps
rg -o 'process.env.[A-Z0-9_]+' backend apps scripts tools
```

다음 명령은 금지한다.

```text
env 전체 출력
printenv SECRET_NAME
cat 실제 .env
security find-generic-password -w
private key cat
credential 값을 채팅·문서·commit에 붙여넣기
```

## 10. 이관 패키지의 credential 결론

```text
PLAINTEXT_SECRET_INCLUDED: NO
CURRENT_FRONTEND_API_NAME: VITE_API_BASE
CURRENT_FRONTEND_API_VALUE: NOT PROVIDED
ANTHROPIC_KEY_LOCATION: CURRENT USER ENVIRONMENT / SECURE STORE
GIT_AUTH_LOCATION: SSH AGENT / KEYCHAIN
CAFE24_SFTP_DB_LOCATION: CAFE24 ADMIN / OWNER PASSWORD MANAGER
PRODUCTION_CREDENTIAL_VERIFICATION: NOT EXECUTED
```
