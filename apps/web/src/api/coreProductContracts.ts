export type CoreDataSource = "SYNTHETIC_FIXTURE";
export type CoreVisualMode = "FULL" | "FAST" | "LIGHT" | "STATIC";
export type CoreAvailability = "AVAILABLE" | "UNAVAILABLE" | "NOT_COMPUTED" | "INSUFFICIENT_DATA";

export interface CoreProvenance {
  readonly source: CoreDataSource;
  readonly updatedAt: string;
}

export interface CorePlayer {
  readonly id: string;
  readonly displayName: string;
  readonly shirtNumber: string;
  readonly primaryPosition: string;
  readonly secondaryPosition: string;
}

export interface CoreTeam {
  readonly id: string;
  readonly displayName: string;
  readonly formation: string;
}

export interface CoreScheduleItem {
  readonly kind: "TRAINING" | "MATCH";
  readonly label: string;
  readonly startsAt: string;
  readonly availability: CoreAvailability;
}

export interface CoreStadiumHome extends CoreProvenance {
  readonly player: CorePlayer;
  readonly team: CoreTeam;
  readonly visualMode: CoreVisualMode;
  readonly nextTraining: CoreScheduleItem;
  readonly nextMatch: CoreScheduleItem;
  readonly scoreboardLabel: string;
}

export interface CoreTeammateMarker {
  readonly id: string;
  readonly shirtNumber: string;
  readonly position: string;
  readonly publicName: null;
  readonly avatarUrl: null;
  readonly x: number;
  readonly y: number;
}

export interface CoreFormation extends CoreProvenance {
  readonly shapeLabel: string;
  readonly player: CorePlayer;
  readonly teammates: readonly CoreTeammateMarker[];
}

export interface CoreSpatialAnchor {
  readonly id: string;
  readonly kind: "PLAYER" | "TRAINING" | "TEAM" | "CAREER" | "VIDEO";
  readonly title: string;
  readonly detail: string;
  readonly destination: string;
}

export interface CoreSpatialHome extends CoreProvenance {
  readonly team: CoreTeam;
  readonly anchors: readonly CoreSpatialAnchor[];
  readonly nextTraining: CoreScheduleItem;
  readonly nextMatch: CoreScheduleItem;
  readonly scoreboardLabel: string;
}

export interface CoreVideoSurface extends CoreProvenance {
  readonly availability: CoreAvailability;
  readonly publisherName: string;
  readonly canonicalUrl: string;
  readonly autoplay: false;
}

export interface CoreCareerSurface extends CoreProvenance {
  readonly availability: CoreAvailability;
  readonly message: string;
}
