import { RECONCILED_PATCH_OPERATIONS, REAL_API_EXTENSION_COUNT } from "../src-contracts/reconciled-api.js";
function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
const operationIds = RECONCILED_PATCH_OPERATIONS.map((x) => x.operationId);
assert(new Set(operationIds).size === operationIds.length, "operationId must be unique");
const methodPaths = RECONCILED_PATCH_OPERATIONS.map((x) => `${x.method} ${x.path}`);
assert(new Set(methodPaths).size === methodPaths.length, "method/path must be unique");
assert(REAL_API_EXTENSION_COUNT === 5, "real API extension count drift");
