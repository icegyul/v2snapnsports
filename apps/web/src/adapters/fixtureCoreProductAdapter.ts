import type { CoreCareerSurface, CoreFormation, CoreSpatialHome, CoreStadiumHome, CoreVideoSurface } from "../api/coreProductContracts";

const updatedAt = "2026-08-28T00:00:00.000Z";
const source = "SYNTHETIC_FIXTURE" as const;

const player = { id: "demo-player-08", displayName: "데모 선수", shirtNumber: "8", primaryPosition: "중앙 미드필더", secondaryPosition: "수비형 미드필더" } as const;
const team = { id: "demo-u17-a", displayName: "DEMO U17 A팀", formation: "4-3-3" } as const;
const nextTraining = { kind: "TRAINING" as const, label: "다음 훈련 · 데모 일정", startsAt: "2026-08-28T18:30:00+09:00", availability: "AVAILABLE" as const };
const nextMatch = { kind: "MATCH" as const, label: "다음 경기 · 데모 일정", startsAt: "2026-08-30T14:00:00+09:00", availability: "AVAILABLE" as const };

export class FixtureCoreProductAdapter {
  async getStadiumHome(): Promise<CoreStadiumHome> {
    return { source, updatedAt, player, team, visualMode: "FULL", nextTraining, nextMatch, scoreboardLabel: "데모 팀 상태 · 일정 확인 필요" };
  }

  async getFormation(): Promise<CoreFormation> {
    return {
      source,
      updatedAt,
      shapeLabel: "4-3-3",
      player,
      teammates: [
        { id: "demo-tm-4", shirtNumber: "4", position: "DF", publicName: null, avatarUrl: null, x: 22, y: 35 },
        { id: "demo-tm-7", shirtNumber: "7", position: "MF", publicName: null, avatarUrl: null, x: 72, y: 44 },
        { id: "demo-tm-11", shirtNumber: "11", position: "FW", publicName: null, avatarUrl: null, x: 70, y: 22 }
      ]
    };
  }

  async getSpatialHome(): Promise<CoreSpatialHome> {
    return {
      source,
      updatedAt,
      team,
      nextTraining,
      nextMatch,
      scoreboardLabel: "데모 팀 상태 · 일정 확인 필요",
      anchors: [
        { id: "player", kind: "PLAYER", title: "나", detail: "중앙 미드필더", destination: "/player/career" },
        { id: "training", kind: "TRAINING", title: "훈련", detail: nextTraining.label, destination: "/training" },
        { id: "team", kind: "TEAM", title: "팀", detail: "4-3-3 포메이션", destination: "/home/formation" },
        { id: "career", kind: "CAREER", title: "커리어", detail: "커리어 패스포트", destination: "/player/career" },
        { id: "video", kind: "VIDEO", title: "영상", detail: "공개 가능 여부 확인", destination: "/video" }
      ]
    };
  }

  async getVideoSurface(): Promise<CoreVideoSurface> {
    return { source, updatedAt, availability: "UNAVAILABLE", publisherName: "데모 미디어 소스", canonicalUrl: "https://example.invalid/demo-video", autoplay: false };
  }

  async getCareerSurface(): Promise<CoreCareerSurface> {
    return { source, updatedAt, availability: "NOT_COMPUTED", message: "검증된 커리어 기록이 연결되면 표시합니다." };
  }
}
