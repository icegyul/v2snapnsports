import { useMemo, useState } from "react";
import type { CoreFormation } from "../../api/coreProductContracts";
import { fieldPercent, ownCoordinate, pitchToFieldPercent } from "./tacticalProjection";
import { tacticsCardProfile, type TacticsCardProfile } from "./teamTacticsCards";

interface TeamTacticsFieldProps {
  readonly formation: CoreFormation;
}

type TeammateMarker = Readonly<{
  id: string;
  shirtNumber: string;
  position: string;
  left: number;
  top: number;
  profile: TacticsCardProfile;
}>;

/**
 * P0-B tactical layer, FC-game presentation. Pure CSS/SVG/HTML — must stay
 * fully functional without WebGL so STATIC entry shows the same tactical
 * meaning as 3D entry. Only connected fixture teammates are rendered;
 * nobody is invented. Ratings/stats are deterministic demo values until the
 * backend supplies real ones (teamTacticsCards.ts).
 */
export function TeamTacticsField({ formation }: TeamTacticsFieldProps) {
  const [selected, setSelected] = useState<string>("OWN");

  const own = useMemo(
    () => pitchToFieldPercent(ownCoordinate(formation.player.primaryPosition)),
    [formation.player.primaryPosition],
  );
  const ownProfile = useMemo(
    () => tacticsCardProfile(formation.player.shirtNumber, formation.player.primaryPosition),
    [formation.player.primaryPosition, formation.player.shirtNumber],
  );
  const teammates = useMemo<readonly TeammateMarker[]>(
    () => formation.teammates.map((teammate) => ({
      id: teammate.shirtNumber,
      shirtNumber: teammate.shirtNumber,
      position: teammate.position,
      left: fieldPercent(teammate.x),
      top: fieldPercent(teammate.y),
      profile: tacticsCardProfile(teammate.shirtNumber, teammate.position),
    })),
    [formation.teammates],
  );
  const selectedTeammate = teammates.find((teammate) => teammate.id === selected) ?? null;
  const panelProfile = selectedTeammate ? selectedTeammate.profile : ownProfile;
  const panelTitle = selectedTeammate
    ? `#${selectedTeammate.shirtNumber} 동료`
    : `#${formation.player.shirtNumber} 나`;
  const panelPosition = selectedTeammate ? selectedTeammate.position : formation.player.primaryPosition;

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

      <div className="team-tactics-stage">
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
            data-role={ownProfile.role}
            className={`team-tactics-marker team-tactics-own ${selected === "OWN" ? "is-selected" : ""}`}
            style={{ left: `${own.left}%`, top: `${own.top}%` }}
            aria-label={`내 위치, 등번호 ${formation.player.shirtNumber}, ${formation.player.primaryPosition}`}
            aria-pressed={selected === "OWN"}
            onClick={() => setSelected("OWN")}
          >
            <span className="team-tactics-rating">{ownProfile.rating}</span>
            <span className="team-tactics-avatar" aria-hidden="true">{formation.player.shirtNumber}</span>
            <span className="team-tactics-num">#{formation.player.shirtNumber}</span>
            <span className="team-tactics-tag">나</span>
          </button>

          {teammates.map((teammate) => (
            <button
              key={teammate.id}
              type="button"
              data-testid="tactics-marker"
              data-role={teammate.profile.role}
              className={`team-tactics-marker team-tactics-mate ${selected === teammate.id ? "is-selected" : ""}`}
              style={{ left: `${teammate.left}%`, top: `${teammate.top}%` }}
              aria-label={`동료 등번호 ${teammate.shirtNumber}, ${teammate.position}`}
              aria-pressed={selected === teammate.id}
              onClick={() => setSelected(teammate.id)}
            >
              <span className="team-tactics-rating">{teammate.profile.rating}</span>
              <span className="team-tactics-avatar" aria-hidden="true">{teammate.shirtNumber}</span>
              <span className="team-tactics-num">#{teammate.shirtNumber}</span>
              <span className="team-tactics-tag">{teammate.position}</span>
            </button>
          ))}
        </div>

        <aside
          className="team-tactics-panel"
          aria-label="선수 상세"
          data-panel-player={selectedTeammate ? selectedTeammate.id : "OWN"}
        >
          <header className="team-tactics-panel-head">
            <span className="team-tactics-panel-rating" data-role={panelProfile.role}>{panelProfile.rating}</span>
            <span className="team-tactics-panel-title">
              <strong>{panelTitle}</strong>
              <span>{panelPosition}</span>
            </span>
          </header>
          <dl className="team-tactics-panel-stats">
            {panelProfile.stats.map((stat) => (
              <div key={stat.key} className="team-tactics-stat-row">
                <dt>{stat.label}</dt>
                <dd>
                  <span className="team-tactics-stat-bar" aria-hidden="true">
                    <span style={{ width: `${Math.round((stat.value / 135) * 100)}%` }} data-strong={stat.value >= 110 ? "true" : "false"} />
                  </span>
                  <span className="team-tactics-stat-value">{stat.value}</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="team-tactics-panel-note">데모 능력치 · 실데이터 연동 전</p>
        </aside>
      </div>

      <p className="team-tactics-selection" aria-live="polite">
        {selectedTeammate
          ? `연결 강조 · #${selectedTeammate.shirtNumber} ${selectedTeammate.position}`
          : "기준 · 내 위치"}
      </p>
    </section>
  );
}
