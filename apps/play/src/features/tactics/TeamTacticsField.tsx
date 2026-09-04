import { useMemo, useState } from "react";
import type { PlayFormation } from "./types";
import { pitchToFieldPercent } from "./tacticalProjection";
import {
  FORMATION_SHAPES,
  buildFormationLineup,
  getFormationShape,
  loadFormationId,
  saveFormationId,
  type FormationId,
  type LineupEntry,
} from "./teamFormationShapes";
import { tacticsCardProfile, type TacticsCardProfile } from "./teamTacticsCards";

interface TeamTacticsFieldProps {
  readonly formation: PlayFormation;
}

/**
 * FC-game style tactics board. Pure CSS/SVG/HTML — no WebGL, no 3D engine,
 * so it loads fast and works everywhere. The chosen shape lays out eleven
 * slots; only people who are actually connected fill them and the rest
 * stay visibly open, so nobody is ever invented. Ratings/stats are
 * deterministic demo values (teamTacticsCards.ts) until the backend
 * supplies real ones.
 */
export function TeamTacticsField({ formation }: TeamTacticsFieldProps) {
  const [selected, setSelected] = useState<string>("OWN");
  const [formationId, setFormationId] = useState<FormationId>(() => {
    try {
      return loadFormationId(window.localStorage, formation.shapeLabel);
    } catch {
      return getFormationShape("4-3-3").id;
    }
  });

  const lineup = useMemo(
    () => buildFormationLineup(
      getFormationShape(formationId),
      { shirtNumber: formation.player.shirtNumber, primaryPosition: formation.player.primaryPosition },
      formation.teammates.map((teammate) => ({
        shirtNumber: teammate.shirtNumber,
        position: teammate.position,
        x: teammate.x,
        y: teammate.y,
      })),
    ),
    [formation.player.primaryPosition, formation.player.shirtNumber, formation.teammates, formationId],
  );

  const ownProfile = useMemo(
    () => tacticsCardProfile(formation.player.shirtNumber, formation.player.primaryPosition),
    [formation.player.primaryPosition, formation.player.shirtNumber],
  );
  const profiles = useMemo(() => {
    const map = new Map<string, TacticsCardProfile>();
    for (const entry of lineup) {
      if (entry.kind === "EMPTY") continue;
      map.set(entry.shirtNumber, tacticsCardProfile(entry.shirtNumber, entry.position));
    }
    return map;
  }, [lineup]);

  const ownEntry = lineup.find((entry) => entry.kind === "OWN");
  const teammateEntries = lineup.filter((entry) => entry.kind === "TEAMMATE");
  const openSlots = lineup.filter((entry) => entry.kind === "EMPTY");
  const selectedTeammate = teammateEntries.find((entry) => entry.shirtNumber === selected) ?? null;

  const panelProfile = selectedTeammate
    ? profiles.get(selectedTeammate.shirtNumber) ?? ownProfile
    : ownProfile;
  const panelTitle = selectedTeammate
    ? `#${selectedTeammate.shirtNumber} 동료`
    : `#${formation.player.shirtNumber} 나`;
  const panelPosition = selectedTeammate ? selectedTeammate.position : formation.player.primaryPosition;

  const chooseFormation = (id: FormationId) => {
    setFormationId(id);
    try {
      saveFormationId(window.localStorage, id);
    } catch {
      // Shape still applies for this session even when storage is blocked.
    }
  };

  const place = (entry: LineupEntry) => pitchToFieldPercent({ x: entry.slot.x, z: entry.slot.z });

  return (
    <section
      className="team-tactics-field"
      aria-label="팀 전술 필드"
      data-selected-marker={selected}
      data-tactics-teammate-count={teammateEntries.length}
      data-open-slots={openSlots.length}
      data-formation={formationId}
    >
      <header className="team-tactics-head">
        <span className="team-tactics-kicker">TEAM TACTICS</span>
        <strong className="team-tactics-shape">{formationId}</strong>
        <span className="team-tactics-own-line">내 위치 #{formation.player.shirtNumber} {formation.player.primaryPosition}</span>
        <span className="team-tactics-count">연결된 동료 {teammateEntries.length}명</span>
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
            {ownEntry && selectedTeammate && (
              <line
                className="team-tactics-connection"
                data-connection-to={selectedTeammate.shirtNumber}
                x1={(place(ownEntry).left / 100) * 105}
                y1={(place(ownEntry).top / 100) * 68}
                x2={(place(selectedTeammate).left / 100) * 105}
                y2={(place(selectedTeammate).top / 100) * 68}
              />
            )}
          </svg>

          {openSlots.map((entry) => (
            <span
              key={entry.slot.id}
              data-testid="tactics-slot"
              className="team-tactics-slot"
              data-role={entry.slot.role}
              style={{ left: `${place(entry).left}%`, top: `${place(entry).top}%` }}
              aria-hidden="true"
            >
              {entry.slot.label}
            </span>
          ))}

          {ownEntry && (
            <button
              type="button"
              data-testid="tactics-marker"
              data-role={ownProfile.role}
              className={`team-tactics-marker team-tactics-own ${selected === "OWN" ? "is-selected" : ""}`}
              style={{ left: `${place(ownEntry).left}%`, top: `${place(ownEntry).top}%` }}
              aria-label={`내 위치, 등번호 ${formation.player.shirtNumber}, ${formation.player.primaryPosition}`}
              aria-pressed={selected === "OWN"}
              onClick={() => setSelected("OWN")}
            >
              <span className="team-tactics-rating">{ownProfile.rating}</span>
              <span className="team-tactics-avatar" aria-hidden="true">{formation.player.shirtNumber}</span>
              <span className="team-tactics-num">#{formation.player.shirtNumber}</span>
              <span className="team-tactics-tag">나</span>
            </button>
          )}

          {teammateEntries.map((entry) => {
            const profile = profiles.get(entry.shirtNumber) ?? ownProfile;
            return (
              <button
                key={entry.shirtNumber}
                type="button"
                data-testid="tactics-marker"
                data-role={profile.role}
                className={`team-tactics-marker team-tactics-mate ${selected === entry.shirtNumber ? "is-selected" : ""}`}
                style={{ left: `${place(entry).left}%`, top: `${place(entry).top}%` }}
                aria-label={`동료 등번호 ${entry.shirtNumber}, ${entry.position}`}
                aria-pressed={selected === entry.shirtNumber}
                onClick={() => setSelected(entry.shirtNumber)}
              >
                <span className="team-tactics-rating">{profile.rating}</span>
                <span className="team-tactics-avatar" aria-hidden="true">{entry.shirtNumber}</span>
                <span className="team-tactics-num">#{entry.shirtNumber}</span>
                <span className="team-tactics-tag">{entry.position}</span>
              </button>
            );
          })}
        </div>

        <aside
          className="team-tactics-panel"
          aria-label="선수 상세"
          data-panel-player={selectedTeammate ? selectedTeammate.shirtNumber : "OWN"}
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

      <footer className="team-tactics-footer">
        <div className="team-tactics-formations" role="group" aria-label="포메이션 선택">
          {FORMATION_SHAPES.map((shape) => (
            <button
              key={shape.id}
              type="button"
              className={`team-tactics-formation-chip ${shape.id === formationId ? "is-active" : ""}`}
              aria-label={`포메이션 ${shape.id}`}
              aria-pressed={shape.id === formationId}
              onClick={() => chooseFormation(shape.id)}
            >
              {shape.id}
            </button>
          ))}
        </div>
        <p className="team-tactics-selection" aria-live="polite">
          {selectedTeammate
            ? `연결 강조 · #${selectedTeammate.shirtNumber} ${selectedTeammate.position}`
            : `기준 · 내 위치 · 빈 자리 ${openSlots.length}`}
        </p>
      </footer>
    </section>
  );
}
