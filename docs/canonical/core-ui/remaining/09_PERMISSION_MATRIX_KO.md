# PERMISSION MATRIX

## 1. Evaluation order

1. session
2. account state
3. feature visibility
4. verified RoleGrant
5. tenant scope
6. team scope
7. subject/athlete scope
8. consent
9. safeguarding/block/moderation
10. field-level projection
11. render

RolePreference는 permission이 아니다.

## 2. Negative matrix

| Case | Community | Training | Video | Career | Expected |
|---|---|---|---|---|---|
| cross-tenant | post/resource deny | session deny | asset deny | private projection deny | generic FORBIDDEN |
| cross-team | TEAM post deny | session deny | team video deny | team-internal source 제외 | no metadata leak |
| unrelated guardian | minor private deny | unrelated attendance deny | private minor deny | passport deny | SUBJECT/CONSENT deny |
| revoked guardian | cached permission invalidate | mutate deny | playback reauth/deny | share projection revoke | stale cache로 권한 우회 금지 |
| unverified manager | moderation deny | staff mutate deny | private asset deny | club/agent projection deny | ROLE_GRANT_REQUIRED |
| role escalation | admin/moderator UI 금지 | coach action 금지 | share override 금지 | visibility override 금지 | server deny authoritative |
| foreign athlete media | media field filter | N/A | deny | representative media deny | MEDIA_ACCESS_DENIED |
| hidden community post | hidden replacement | N/A | linked media deny | linked event visibility reevaluate | no hidden count leak |
| blocked relationship | post/action hide | comms 별도 | community-linked media hide | share/contact restriction | BLOCK_RELATIONSHIP_DENIED |
| forbidden direct route | generic | generic | generic | generic | target metadata leak 0 |

## 3. Minor-first projection

### Teammate spatial
기본 최소:
- position
- jersey number

name/avatar는 서버 projection이 허용한 경우만. accessibility tree에도 동일 규칙.

### Video
다른 미성년자 private media는 원본뿐 아니라 thumbnail/poster도 권한 필터 대상.

### Career
이전 구단의 내부 coach note/tactic은 Career로 복제 금지. 공개용 share projection과 본인 legal view를 구분.

### Community
PUBLIC이라도 minor/public policy와 moderation이 더 제한적이면 그 결과를 우선.

## 4. Forbidden UX

403이라고 해서 서버 reason을 그대로 사용자에게 노출하지 않는다. `TENANT_SCOPE_DENIED`, `TEAM_SCOPE_DENIED`, `SUBJECT_SCOPE_DENIED`는 일반적인 "이 콘텐츠를 볼 수 없습니다" 수준으로 처리한다. 안전한 대안 route가 서버에서 명시된 `MINOR_DIRECT_CONTACT_BLOCKED` 유형에만 Guardian/Club mediated route를 제시한다.
