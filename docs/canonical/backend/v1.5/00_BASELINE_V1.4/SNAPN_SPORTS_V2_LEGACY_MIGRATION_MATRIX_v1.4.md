# SNAPN SPORTS V2 LEGACY MIGRATION MATRIX v1.4

Legacy identifiers must be populated by READ-ONLY audit. No table/route names may be guessed.

Migration: INVENTORY → ADAPTER_READ → SHADOW_WRITE → DUAL_VERIFY → CUTOVER, with ROLLBACK_READY before cutover.
