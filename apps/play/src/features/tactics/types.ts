// Local formation shape for the PLAY app. Deliberately not shared with the
// main V2 app's product contracts — this app has no backend yet, so it
// only needs the fields TeamTacticsField actually reads.

export interface PlayFormationPlayer {
  readonly shirtNumber: string;
  readonly primaryPosition: string;
}

export interface PlayFormationTeammate {
  readonly shirtNumber: string;
  readonly position: string;
  readonly x: number;
  readonly y: number;
}

export interface PlayFormation {
  readonly shapeLabel: string;
  readonly player: PlayFormationPlayer;
  readonly teammates: readonly PlayFormationTeammate[];
}
