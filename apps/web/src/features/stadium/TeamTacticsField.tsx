import { useMemo, useState } from "react";
import type { CoreFormation } from "../../api/coreProductContracts";
import { fieldPercent, ownCoordinate, pitchToFieldPercent } from "./tacticalProjection";

interface TeamTacticsFieldProps {
  readonly formation: CoreFormation;
}

type TeammateMarker = Readonly<{
  id: string;
  shirtNumber: string;
  position: string;
  left: number;
  top: number;
}>;

/**
 * P0-B tactical layer. Pure SVG/HTML — must stay fully functional without
 * WebGL so STATIC entry shows the same tactical meaning as 3D entry.
 * Only connected fixture teammates are rendered; nobody is invented.
 */
export function TeamTacticsField({ formation }: TeamTacticsFieldProps) {
  const [selected, setSelected] = useState<string>("OWN");

  const own = useMemo(
    () => pitchToFieldPercent(ownCoordinate(formation.player.primaryPosition)),
    [formation.player.primaryPosition],
  );
  const teammates = useMemo<readonly TeammateMarker[]>(
    () => formation.teammates.map((teammate) => ({
      id: teammate.shirtNumber,
      shirtNumber: teammate.shirtNumber,
      position: teammate.position,
      left: fieldPercent(teammate.x),
      top: fieldPercent(teammate.y),
    })),
    [formation.teammates],
  );
  const selectedTeammate = teammates.find((teammate) => teammate.id === selected) ?? null;

  return (
    <section
      className="team-tactics-field"
      aria-label="팀 전술 필드"
      data-selected-marker={selected}
      data-tactics-teammate-count={teammates.length}
    >
      <header className="team-tactics-head">
        <span className="team-tactics-kicker">TEAM TACTICS</span>
        <strong className="team-tactics-shape">{formation.shapeLabel}</strong>
        <span className="team-tactics-own-line">내 위치 #{formation.player.shirtNumber} {formation.player.primaryPosition}</span>
        <span className="team-tactics-count">연결된 동료 {teammates.length}명</span>
      </header>

      <div className="team-tactics-pitch" role="group" aria-label="전술 배치 마커">
        <svg className="team-tactics-lines" viewBox="0 0 105 68" preserveAspectRatio="none" aria-hidden="true">
          <rect className="team-tactics-line" x="1.2" y="1.2" width="102.6" height="65.6" />
          <line className="team-tactics-line" x1="52.5" y1="1.2" x2="52.5" y2="66.8" />
          <circle className="team-tactics-line" cx="52.5" cy="34" r="9.15" />
          <circle className="team-tactics-fill" cx="52.5" cy="34" r="0.7" />
          <rect className="team-tactics-line" x="1.2" y="13.84" width="16.5" height="40.32" />
          <rect className="team-tactics-line" x="87.3" y="13.84" width="16.5" height="40.32" />
          <rect className="team-tactics-line" x="1.2" y="24.84" width="5.5" height="18.32" />
          <rect className="team-tactics-line" x="98.3" y="24.84" width="5.5" height="18.32" />
          <circle className="team-tactics-fill" cx="12.2" cy="34" r="0.7" />
          <circle className="team-tactics-fill" cx="92.8" cy="34" r="0.7" />
          {selectedTeammate && (
            <line
              className="team-tactics-connection"
              data-connection-to={selectedTeammate.id}
              x1={(own.left / 100) * 105}
              y1={(own.top / 100) * 68}
              x2={(selectedTeammate.left / 100) * 105}
              y2={(selectedTeammate.top / 100) * 68}
            />
          )}
        </svg>

        <button
          type="button"
          data-testid="tactics-marker"
          className={`team-tactics-marker team-tactics-own ${selected === "OWN" ? "is-selected" : ""}`}
          style={{ left: `${own.left}%`, top: `${own.top}%` }}
          aria-label={`내 위치, 등번호 ${formation.player.shirtNumber}, ${formation.player.primaryPosition}`}
          aria-pressed={selected === "OWN"}
          onClick={() => setSelected("OWN")}
        >
          <span className="team-tactics-num">#{formation.player.shirtNumber}</span>
          <span className="team-tactics-tag">나</span>
        </button>

        {teammates.map((teammate) => (
          <button
            key={teammate.id}
            type="button"
            data-testid="tactics-marker"
            className={`team-tactics-marker team-tactics-mate ${selected === teammate.id ? "is-selected" : ""}`}
            style={{ left: `${teammate.left}%`, top: `${teammate.top}%` }}
            aria-label={`동료 등번호 ${teammate.shirtNumber}, ${teammate.position}`}
            aria-pressed={selected === teammate.id}
            onClick={() => setSelected(teammate.id)}
          >
            <span className="team-tactics-num">#{teammate.shirtNumber}</span>
            <span className="team-tactics-tag">{teammate.position}</span>
          </button>
        ))}
      </div>

      <p className="team-tactics-selection" aria-live="polite">
        {selectedTeammate
          ? `연결 강조 · #${selectedTeammate.shirtNumber} ${selectedTeammate.position}`
          : "기준 · 내 위치"}
      </p>
    </section>
  );
}
