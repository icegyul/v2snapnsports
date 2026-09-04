import { Link } from "react-router-dom";
import { TeamTacticsField } from "./TeamTacticsField";
import type { PlayFormation } from "./types";

// Demo-only lineup until a real account/team connects. Only these entries
// render as filled cards; every other slot in the chosen shape stays open.
const DEMO_FORMATION: PlayFormation = {
  shapeLabel: "4-3-3",
  player: { shirtNumber: "10", primaryPosition: "CAM" },
  teammates: [
    { shirtNumber: "1", position: "GK", x: 8, y: 50 },
    { shirtNumber: "4", position: "CB", x: 22, y: 40 },
    { shirtNumber: "7", position: "RW", x: 76, y: 76 },
    { shirtNumber: "9", position: "ST", x: 88, y: 50 },
  ],
};

export function TacticsPage() {
  return (
    <main className="shell-main screen">
      <header className="screen-head">
        <p className="eyebrow">TACTICS</p>
        <h1>전술 보드</h1>
        <p className="screen-sub">포메이션을 골라 내 팀을 배치해보세요. 실제 팀 연동 전까지는 데모 데이터입니다.</p>
      </header>

      <div className="tactics-page-wrap">
        <TeamTacticsField formation={DEMO_FORMATION} />
      </div>

      <p className="screen-note">빈 자리는 아직 연결되지 않은 포지션입니다. 실제 팀원이 없다면 지어내지 않습니다.</p>
      <Link className="surface-link" to="/">홈으로</Link>
    </main>
  );
}
