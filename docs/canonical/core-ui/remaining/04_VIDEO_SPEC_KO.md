# VIDEO UI SPEC

## 1. 경계

Production media pipeline은 이 pack에서 확정하거나 활성화하지 않는다. UI는 media ID에서 URL을 조합하지 않고 **VideoAdapter가 반환한 playback source만** 사용한다.

가짜 AI overlay, tracking box, heatmap, 자동 분석 badge 금지.

## 2. 화면

| 화면 | route | 계약 |
|---|---|---|
| Video Home | `/video` | representative + recent visible |
| Video Library | `/video` | permission-filtered library |
| Video Detail | `/video/:video_id` | metadata + playback + representative selection |
| Representative selection | sheet | Career Passport highlight seam |
| Permission denied | same route | metadata leak 없는 generic state |
| Empty/Offline/Error | same route | cache/adapter state |

`/video/:video_id`는 UI route extension이다. 데이터는 v1.3 canonical `GET /v2/media/{id}`를 사용하며 새 API를 만들지 않는다.

## 3. DTO

- `VideoAssetView`
- `VideoOwnership`
- `VideoVisibility`
- `VideoPlaybackSource`

`VideoPlaybackSource.src`는 fixture/local 또는 adapter가 얻은 ephemeral locator다. asset ID를 CDN URL로 추측하지 않는다.

## 4. Ownership / visibility

모든 asset은 owner type + source context를 가진다.

- PLAYER
- TEAM
- CLUB
- COMMUNITY_POST

visibility:

- PRIVATE
- GUARDIAN
- TEAM
- CLUB
- COMMUNITY
- PUBLIC

다른 미성년자 private asset은 viewer가 team/guardian/explicit consent 관계를 갖지 않으면 렌더하지 않는다. 썸네일도 권한 대상이다.

## 5. Adapter

- listVisible → v1.3 `GET /v2/videos`
- getVideo → v1.3 `GET /v2/media/{id}`
- upload flow가 필요한 Composer는 기존 v1.4 `POST /v2/media/uploads`
- representative selection → v1.3 Career Passport highlight operation

위 operation은 v1.3 canonical에 이미 있으므로 OpenAPI v1.4 승격 gap이다.

## 6. Engine / Algorithm

- E03/A03 authorization
- E04 guardian/consent
- E17/A21 media access
- E30/A31 revoke/delete 결과 반영
- E32/A33 search seam
- E36/A38/A39 Career representative video
- E40/A44 safeguarding
- E07/A22 hard-disabled AI UI 제거

## 7. Permission negative cases

- foreign athlete private video → `MEDIA_ACCESS_DENIED`
- unrelated guardian → deny
- revoked guardian → stale signed/playback source 재사용 금지
- cross-tenant team video → deny
- blocked relationship의 community-linked media → hide
- direct URL forbidden → generic state
- source deleted/revoked → Career Passport 대표 영상에서도 제거/비활성

## 8. Accessibility

video element에는 label/title, controls, caption track seam을 둔다. autoplay with sound 금지. keyboard로 play/pause/focus 가능. poster image alt는 장식이면 empty alt, 의미 있으면 안전한 description. Permission denied 화면은 소유자/선수 이름을 다시 노출하지 않는다.
