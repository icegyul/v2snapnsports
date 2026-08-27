import { describe, expect, it } from "vitest";
import { advanceStadiumExperience, type StadiumExperienceState } from "../three/stadiumState";

describe("StadiumExperienceStateMachine", () => {
  it("moves from EXTERIOR through the canonical spatial sequence", () => {
    let state: StadiumExperienceState = "EXTERIOR";
    state = advanceStadiumExperience(state);
    state = advanceStadiumExperience(state);
    state = advanceStadiumExperience(state);
    state = advanceStadiumExperience(state);
    state = advanceStadiumExperience(state);
    expect(state).toBe("SPATIAL_HOME");
  });
});
