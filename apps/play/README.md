# SnapN Sports PLAY

`play.snapnsports.com`용 별도 미니 앱입니다. 본편 V2 앱(`apps/web`)이 실제 백엔드/인증
연결을 기다리는 동안, 커뮤니티와 전술 보드 두 기능만 빠르게 사람들에게 보여주기 위해
분리했습니다.

## 범위 (의도적으로 좁음)

- **커뮤니티** (`/community`): 게시물 목록·상세·작성. 전부 기기 로컬 고정 데이터(fixture)이며
  실제 서버/DB 연동은 아직 없습니다.
- **전술 보드** (`/tactics`): FC 게임 스타일 포메이션 판. 데모 라인업만 표시하며, 비어 있는
  자리는 실제로 연결된 팀원이 없다는 뜻입니다(가짜 인원을 채우지 않습니다).
- 3D 스타디움, 실인증, 매니저/어드민 등 본편의 나머지 기능은 포함하지 않습니다 — 그래서
  가볍고 빠릅니다.

의존성도 최소로 유지했습니다: React + react-router-dom만 사용하고, three.js/motion 같은
무거운 라이브러리는 넣지 않았습니다.

## 로컬 실행

```bash
cd apps/play
npm install
npm run dev
```

## 배포 파이프라인

`.github/workflows/deploy-play-cafe24.yml`이 `deploy/play` 브랜치로 push될 때(또는 수동
실행) `apps/play`를 빌드해서 Cafe24 FTP로 `play/` 디렉터리(기본값)에 올립니다. 기존
`snapnsports.com/v2/` 배포(`deploy-v2-cafe24.yml`)와 동일한 자격 증명 시크릿을 재사용합니다.

### 이 저장소가 할 수 없는 것 — 직접 해주셔야 하는 부분

1. **Cafe24 서브도메인 생성**: `play.snapnsports.com`이 실제 호스팅 문서 루트의 특정
   폴더(예: FTP 홈 기준 `play/`)를 가리키도록 Cafe24 관리자 패널에서 서브도메인을 만들어
   주세요. `v2/`가 `/v2/` 하위경로로 서비스되는 것과 달리, `play`는 별도 서브도메인이라
   문서 루트 지정 방식이 다를 수 있습니다.
2. **DNS**: `play` 서브도메인 A/CNAME 레코드가 해당 호스팅을 가리키도록 설정.
3. **GitHub 저장소 설정**: 배포 대상 폴더가 `play/`가 아니라면, 저장소 Variables에
   `CAFE24_PLAY_FTP_SERVER_DIR` 값을 실제 폴더명으로 추가해주세요. FTP 자격 증명은 기존
   `CAFE24` 시크릿(또는 `CAFE24_FTP_SERVER`/`_USERNAME`/`_PASSWORD`)을 그대로 사용합니다.
4. 준비가 끝나면 `deploy/play` 브랜치로 push하거나 Actions 탭에서 워크플로를 수동 실행하면
   빌드 후 자동 배포됩니다.

## 다음에 실제 데이터로 바꾸려면

커뮤니티 저장소는 `src/features/community/communityModel.ts`의 `FixtureCommunityStore` 하나뿐이라
실제 API 클라이언트로 교체할 지점이 명확합니다. 전술 보드의 데모 라인업은
`src/features/tactics/TacticsPage.tsx`의 `DEMO_FORMATION`입니다.
