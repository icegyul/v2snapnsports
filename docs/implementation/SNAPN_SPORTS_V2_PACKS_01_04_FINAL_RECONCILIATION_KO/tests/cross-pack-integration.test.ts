import { PACK_DEPENDENCIES } from "../src-contracts/pack-dependencies.js";
function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
const edge = (source: string, target: string) => PACK_DEPENDENCIES.some((x) => x.source === source && x.target === target);
assert(edge("PACK01.Training","PACK02.CareerPassport"), "Training -> Career missing");
assert(edge("PACK01.Match","PACK03.RefereeWorkspace"), "Match -> Referee missing");
assert(edge("PACK02.Communication","PACK03.TeamManagerWorkspace"), "Communication -> TeamManager missing");
assert(edge("PACK04.RoleVerification","SHARED.RoleGrant"), "Verification -> RoleGrant missing");
assert(edge("SHARED.Earthus","PACK01.ScheduleTrainingMatch"), "Earthus soft context dependency missing");
