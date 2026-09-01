import { Link } from "react-router-dom";
import { FixtureCommunityStore } from "../community/communityModel";

const community = new FixtureCommunityStore();

export function CommunityPage() {
  const posts = community.listFor({ accountId: "fixture-player", teamId: "demo-u17-a" });

  return (
    <main className="shell-main screen">
      <header className="screen-head">
        <p className="eyebrow">COMMUNITY</p>
        <h1>커뮤니티</h1>
        <p className="screen-sub">팀과 리그 소식이 모이는 곳입니다.</p>
      </header>

      <nav className="screen-tabs" aria-label="커뮤니티 분류">
        <button type="button" aria-current="page">전체</button>
        <button type="button">게시글</button>
        <button type="button">뉴스</button>
        <button type="button">영상</button>
        <button type="button">승부예측</button>
      </nav>

      {posts.length === 0 ? (
        <div className="screen-empty">
          <strong>아직 게시물이 없습니다</strong>
          <span>팀에 첫 소식을 남겨보세요.</span>
        </div>
      ) : (
        <ul className="screen-list">
          {posts.map((post) => (
            <li key={post.id}>
              <article className="screen-panel community-post">
                <div className="screen-actions" aria-hidden="true">
                  <span className="screen-pill" data-tone="MUTED">전체 공개</span>
                  <span className="screen-pill" data-tone="MUTED">데모 별칭</span>
                </div>
                <p className="meta">전체 공개 · 데모 별칭</p>
                <h2>게시물</h2>
                <p>{post.body}</p>
                <footer className="screen-actions">
                  <button className="screen-action" data-variant="quiet" type="button" aria-pressed="false">좋아요</button>
                  <Link className="screen-action" data-variant="quiet" to={`/community/post/${post.id}`}>댓글</Link>
                  <Link className="screen-action" to="/community/compose">작성</Link>
                </footer>
              </article>
            </li>
          ))}
        </ul>
      )}

      <p className="screen-note">미성년 선수의 이름과 사진은 기본적으로 공개하지 않습니다.</p>
    </main>
  );
}

export function TrainingPage() {
  return <main className="shell-main"><p className="eyebrow">TRAINING · FIXTURE LOCAL</p><h1>훈련</h1><article className="surface-card"><h2>다음 훈련</h2><p>데모 일정 · 오늘 오후 6:30</p><p>패스 선택과 움직임</p><button type="button">참가 예정</button></article><p className="meta">환경 정보는 연결되지 않았습니다.</p></main>;
}

export function VideoPage() {
  return (
    <main className="shell-main screen">
      <header className="screen-head">
        <p className="eyebrow">VIDEO</p>
        <h1>영상</h1>
        <p className="screen-sub">경기와 훈련 영상이 이곳에 모입니다.</p>
      </header>

      <section className="screen-empty">
        <strong>현재 표시할 수 있는 영상이 없습니다</strong>
        <span>권한이 확인된 영상만 이곳에 표시합니다.</span>
      </section>

      <p className="screen-note">미성년 선수가 등장하는 영상은 보호자 또는 구단 확인을 거친 뒤에만 공개됩니다.</p>
    </main>
  );
}

const verifiedEvent = { title: "DEMO U17 A팀 합류", source: { type: "TEAM_MEMBERSHIP", id: "demo-membership", version: 1, verifiedState: "VERIFIED" } };
export function CareerPassportPage() {
  return <main className="shell-main"><p className="eyebrow">CAREER PASSPORT · FIXTURE LOCAL</p><h1>커리어 패스포트</h1><section className="career-timeline" aria-label="커리어 타임라인"><h2>현재 시즌</h2>{verifiedEvent.source.verifiedState === "VERIFIED" ? <article><h3>{verifiedEvent.title}</h3><p>검증된 기록</p></article> : null}</section><p className="meta">검증된 기록이 연결되면 시즌·포지션·마일스톤이 표시됩니다.</p></main>;
}
