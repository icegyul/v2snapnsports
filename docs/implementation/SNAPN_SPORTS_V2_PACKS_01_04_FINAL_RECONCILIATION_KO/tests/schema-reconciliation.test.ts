import { REAL_SCHEMA_EXTENSION_COUNT, REAL_SCHEMA_EXTENSION_IDS } from "../src-contracts/pack-dependencies.js";
function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
assert(REAL_SCHEMA_EXTENSION_COUNT === 4, "schema extension count drift");
assert(new Set(REAL_SCHEMA_EXTENSION_IDS).size === REAL_SCHEMA_EXTENSION_IDS.length, "schema extension IDs must be unique");
assert(!REAL_SCHEMA_EXTENSION_IDS.some((x) => x.startsWith("P4-")), "PACK04 must not add a real schema table in reconciled draft");
