import { useState } from "react";
import { Link } from "react-router-dom";
import { FixtureCommunityStore, sanitizeCommunityText } from "./communityModel";

const store = new FixtureCommunityStore();

export function CommunityDetailPage() {
  const [hidden, setHidden] = useState(false);
  const [reported, setReported] = useState(false);

  if (hidden) {
    return (
      <main className="shell-main screen">
        <header className="screen-head">
          <p className="eyebrow">COMMUNITY</p>
          <h1>커뮤니티</h1>
        </header>
        <div className="screen-empty">
          <strong>숨긴 게시글입니다</strong>
          <span>이 기기에서만 숨겨집니다. 다른 사람에게는 그대로 보입니다.</span>
        </div>
        <div className="screen-actions">
          <button className="screen-action" type="button" onClick={() => setHidden(false)}>복원</button>
        </div>
      </main>
    );
  }

  return (
    <main className="shell-main screen">
      <header className="screen-head">
        <p className="eyebrow">COMMUNITY</p>
        <h1>게시물</h1>
      </header>

      <article className="screen-panel">
        <div className="screen-actions" aria-hidden="true">
          <span className="screen-pill" data-tone="MUTED">전체 공개</span>
        </div>
        <p>데모 커뮤니티 게시글</p>
        <footer className="screen-actions">
          <button className="screen-action" data-variant="quiet" type="button" onClick={() => setReported(true)}>신고</button>
          <button className="screen-action" data-variant="quiet" type="button" onClick={() => setHidden(true)}>숨기기</button>
          <Link className="screen-action" to="/community/compose">작성</Link>
        </footer>
      </article>

      {reported && <p className="screen-status" role="status">신고가 접수되었습니다</p>}

      <p className="screen-note">신고된 게시물은 운영진이 확인합니다. 숨기기는 이 기기에만 적용됩니다.</p>
    </main>
  );
}

export function CommunityComposerPage() {
  const [body, setBody] = useState("");
  const [saved, setSaved] = useState(false);
  const draft = saved ? store.saveDraft("", body) : null;

  return (
    <main className="shell-main screen">
      <header className="screen-head">
        <p className="eyebrow">COMMUNITY</p>
        <h1>글 작성</h1>
        <p className="screen-sub">임시 저장은 이 기기에만 남습니다.</p>
      </header>

      <div className="screen-panel">
        <div className="auth-field">
          <label htmlFor="community-body">내용</label>
          <textarea
            id="community-body"
            className="screen-textarea"
            aria-label="내용"
            rows={6}
            value={body}
            onChange={(event) => {
              setSaved(false);
              setBody(event.target.value);
            }}
          />
        </div>
        <div className="screen-actions">
          <button className="screen-action" type="button" onClick={() => setSaved(true)}>임시 저장</button>
          <Link className="screen-action" data-variant="quiet" to="/community">커뮤니티로</Link>
        </div>
      </div>

      {draft && (
        <section className="screen-panel">
          <p className="screen-status" role="status">이 기기 임시 저장됨</p>
          <p>{sanitizeCommunityText(draft.body)}</p>
        </section>
      )}

      <p className="screen-note">다른 선수의 이름·사진·연락처는 올리지 않습니다.</p>
    </main>
  );
}
