export type StadiumExperienceState = "EXTERIOR" | "APPROACH" | "PITCH_ENTRY" | "MY_POSITION" | "TEAM_REVEAL" | "SPATIAL_HOME";

const nextState: Record<StadiumExperienceState, StadiumExperienceState> = {
  EXTERIOR: "APPROACH",
  APPROACH: "PITCH_ENTRY",
  PITCH_ENTRY: "MY_POSITION",
  MY_POSITION: "TEAM_REVEAL",
  TEAM_REVEAL: "SPATIAL_HOME",
  SPATIAL_HOME: "SPATIAL_HOME"
};

export function advanceStadiumExperience(state: StadiumExperienceState): StadiumExperienceState {
  return nextState[state];
}
