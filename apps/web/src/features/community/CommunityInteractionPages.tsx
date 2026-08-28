import { useState } from "react";
import { Link } from "react-router-dom";
import { FixtureCommunityStore, sanitizeCommunityText } from "./communityModel";

const store = new FixtureCommunityStore();

export function CommunityDetailPage() {
  const [hidden, setHidden] = useState(false);
  const [reported, setReported] = useState(false);
  if (hidden) return <main className="shell-main"><h1>커뮤니티</h1><p>숨긴 게시글입니다</p><button type="button" onClick={() => setHidden(false)}>복원</button></main>;
  return <main className="shell-main"><p className="eyebrow">COMMUNITY · FIXTURE LOCAL</p><h1>게시물</h1><article><p>데모 커뮤니티 게시글</p><footer><button type="button" onClick={() => setReported(true)}>신고</button><button type="button" onClick={() => setHidden(true)}>숨기기</button><Link to="/community/compose">작성</Link></footer></article>{reported && <p role="status">신고가 접수되었습니다</p>}</main>;
}

export function CommunityComposerPage() {
  const [body, setBody] = useState("");
  const [saved, setSaved] = useState(false);
  const draft = saved ? store.saveDraft("", body) : null;
  return <main className="shell-main"><p className="eyebrow">COMMUNITY · LOCAL DRAFT</p><h1>글 작성</h1><label>내용<textarea aria-label="내용" value={body} onChange={(event) => { setSaved(false); setBody(event.target.value); }} /></label><button type="button" onClick={() => setSaved(true)}>임시 저장</button>{draft && <><p role="status">이 기기 임시 저장됨</p><p>{sanitizeCommunityText(draft.body)}</p></>}</main>;
}
