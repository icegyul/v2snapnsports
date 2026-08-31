# SNAPN SPORTS V2 Stadium — Claude Code 이관 시작 문서

기준일: 2026-08-31 KST  
대상: Claude Code  
저장소: `icegyul/v2snapnsports`  
개발 기준 branch: `codex/stadium-commercial-finish`  
기준 HEAD: `92f7d5211b2c44b17fb9ed71924c859a4f58fc33`

이 패키지는 새 프로젝트나 데모가 아니다. 현재 SnapN Sports V2 Stadium 개발본과 기존 dirty 통합 checkout을 그대로 보존한 이관 패키지다.

## 반드시 읽는 순서

1. `HANDOFF/UPDATE_REASON_AND_FAILURE_RECORD_KO.md`
2. `HANDOFF/CLAUDE_CODE_DEVELOPMENT_DIRECTIVE_KO.md`
3. `HANDOFF/CLAUDE_CODE_HANDOFF_KO.md`
4. `HANDOFF/API_AND_PASSWORD_LOCATION_GUIDE_KO.md`
5. `ORIGINAL_HANDOFF/README_FIRST_KO.md`
6. `ORIGINAL_HANDOFF/DEVELOPMENT_DIRECTIVE_KO.md`
7. `ORIGINAL_HANDOFF/CURRENT_STATUS_KO.md`

## 패키지 구성

```text
README_FIRST_CLAUDE_CODE_KO.md
HANDOFF/
  UPDATE_REASON_AND_FAILURE_RECORD_KO.md
  CLAUDE_CODE_DEVELOPMENT_DIRECTIVE_KO.md
  CLAUDE_CODE_HANDOFF_KO.md
  API_AND_PASSWORD_LOCATION_GUIDE_KO.md
ORIGINAL_HANDOFF/
  README_FIRST_KO.md
  DEVELOPMENT_DIRECTIVE_KO.md
  CURRENT_STATUS_KO.md
ARCHIVES/
  STADIUM_CLAUDE_READY_REPO_FULL.tar.gz
  INTEGRATION_DIRTY_CHECKOUT_FULL.tar.gz
  ORIGINAL_STADIUM_HANDOFF_2026-08-30.zip
GIT/
  SNAPN_SPORTS_ALL_REFS.bundle
STATE/
  SOURCE_BRANCH.txt
  SOURCE_HEAD.txt
  SOURCE_GIT_STATUS.txt
  SOURCE_TRACKED_FILES.txt
  SOURCE_ALL_FILES.txt
  INTEGRATION_BRANCH.txt
  INTEGRATION_HEAD.txt
  INTEGRATION_GIT_STATUS.txt
  VERIFICATION_RESULT.txt
  PACKAGE_CONTENTS.txt
SHA256SUMS.txt
```

## Claude Code 시작 방법

가장 안전한 방법은 `ARCHIVES/STADIUM_CLAUDE_READY_REPO_FULL.tar.gz`를 빈 디렉터리에 푸는 것이다. 이 archive는 유효한 `.git`, 현재 dirty source, untracked assets, `node_modules`, `dist`, `output`을 포함한다.

```bash
tar -xzf ARCHIVES/STADIUM_CLAUDE_READY_REPO_FULL.tar.gz
cd snapn-stadium-claude-ready
git status --short
git branch --show-current
git rev-parse HEAD
npm run typecheck
npm test -- --run
npm run build
```

다른 OS 또는 Node 환경이면 포함된 `node_modules`를 신뢰하지 말고 `npm ci`로 재생성한다. 기존 파일을 삭제하기 전에는 archive가 별도로 보존되어 있는지 확인한다.

## 첫 번째 개발 목표

현재 외부 Home이 WebGL 실패 시 사진형 STATIC fallback으로 내려가는데 줌이 작동하지 않는다. `/home/full`로 들어가도 STATIC에서는 전술 필드가 아니라 `SPATIAL_HOME`으로 즉시 점프한다. 첫 번째 개발 목표는 다음과 같다.

```text
경기장 Home
→ STATIC에서도 wheel/pinch zoom 작동
→ 경기장 입장
→ 즉시 팀 전술 필드
→ 4-3-3
→ 내 위치 #8 중앙 미드필더
→ 실제 연결된 동료 #4 DF / #7 MF / #11 FW
```

없는 선수를 만들어 11명을 채우면 안 된다.

## 절대 금지

- 새 저장소나 새 Stadium 엔진으로 재시작
- `git reset --hard`, `git clean`, 무차별 restore/stash
- 현재 dirty 파일을 누락한 뒤 clean HEAD만 인수인계 기준으로 사용
- STATIC fallback 제거
- 사진을 3D 또는 완료된 서비스라고 주장
- 실제 API/DB/비밀번호 값을 문서나 커밋에 기록
- 실제 선수 이름·얼굴·클럽·유명 경기장 복제
- EPTS, CAMERA_AI, SPORTS_AI 활성화
- 테스트 숫자만으로 비주얼 완료 선언
- commit, push, merge, deploy 자동 실행

현재 상태는 로컬 개발 continuation 가능 상태다. `PRODUCTION_READY`가 아니다.
