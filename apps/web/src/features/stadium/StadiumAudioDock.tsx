import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  enableStadiumAudio,
  getStadiumAudioSnapshot,
  playStadiumAudioCue,
  setStadiumAudioMuted,
  subscribeStadiumAudio,
  type StadiumAudioCue,
  type StadiumAudioSnapshot,
} from "./stadiumAudioDirector";
import "./stadiumAudio.css";

function cueForPath(pathname: string): StadiumAudioCue | null {
  if (pathname === "/home") return "HOME";
  if (pathname === "/home/approach") return "APPROACH";
  if (pathname === "/home/enter") return "PITCH";
  if (pathname === "/home/projection") return "PROJECTION";
  if (pathname === "/home/position") return "POSITION";
  if (pathname === "/home/formation") return "FORMATION";
  if (pathname === "/home/team") return "SPATIAL_HOME";
  return null;
}

function stateLabel(snapshot: StadiumAudioSnapshot): string {
  switch (snapshot.state) {
    case "LOCKED": return "SOUND OFF";
    case "ENABLED": return "SOUND ON";
    case "MUTED": return "MUTED";
    case "UNSUPPORTED": return "UNAVAILABLE";
  }
}

function actionLabel(snapshot: StadiumAudioSnapshot): string {
  switch (snapshot.state) {
    case "LOCKED": return "경기장 사운드 켜기";
    case "ENABLED": return "경기장 사운드 음소거";
    case "MUTED": return "경기장 사운드 다시 켜기";
    case "UNSUPPORTED": return "이 기기에서는 사운드를 사용할 수 없습니다";
  }
}

export function StadiumAudioDock() {
  const location = useLocation();
  const [snapshot, setSnapshot] = useState<StadiumAudioSnapshot>(() => getStadiumAudioSnapshot());

  useEffect(() => subscribeStadiumAudio(() => setSnapshot(getStadiumAudioSnapshot())), []);

  useEffect(() => () => {
    if (getStadiumAudioSnapshot().state === "ENABLED") setStadiumAudioMuted(true);
  }, []);

  useEffect(() => {
    const cue = cueForPath(location.pathname);
    if (cue && snapshot.state === "ENABLED") playStadiumAudioCue(cue);
  }, [location.pathname, snapshot.state]);

  const toggle = async () => {
    if (snapshot.state === "LOCKED") {
      await enableStadiumAudio();
      return;
    }
    if (snapshot.state === "ENABLED") {
      setStadiumAudioMuted(true);
      return;
    }
    if (snapshot.state === "MUTED") {
      setStadiumAudioMuted(false);
    }
  };

  return (
    <aside
      className={`stadium-audio-dock stadium-audio-${snapshot.state.toLowerCase()}`}
      aria-label="경기장 사운드 컨트롤"
      data-audio-state={snapshot.state}
      data-audio-context={snapshot.contextState}
      data-audio-last-cue={snapshot.lastCue ?? "NONE"}
      data-audio-cue-count={snapshot.cueCount}
    >
      <span className="stadium-audio-pulse" aria-hidden="true"><i /><i /><i /></span>
      <span className="stadium-audio-state">{stateLabel(snapshot)}</span>
      <button
        className="stadium-audio-toggle"
        type="button"
        onClick={() => { void toggle(); }}
        disabled={snapshot.state === "UNSUPPORTED"}
        aria-label={actionLabel(snapshot)}
      >
        {snapshot.state === "LOCKED" ? "사운드" : snapshot.state === "ENABLED" ? "음소거" : snapshot.state === "MUTED" ? "소리 켜기" : "미지원"}
      </button>
    </aside>
  );
}
