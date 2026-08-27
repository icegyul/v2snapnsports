# Media Backup and Restore Report

## Verdict

**Status: `FAIL — NO VERIFIED SOURCE OR REHEARSAL`**

The local deployment backup covers app/API artifacts, not the production `/files/` object set. No media manifest, encrypted backup, schedule, retention, or isolated restore result was found.

## Required paired backup

1. Capture DB metadata/URLs and media manifest within an approved consistency window.
2. Record relative path, bytes, SHA-256, detected MIME, modification time, and owner/reference candidate.
3. Reconcile DB→file and file→DB directions.
4. Encrypt and store outside the web root/repository with retention and key owner.
5. Restore to a non-public isolated directory.
6. Recompute hashes and decode representative objects.
7. Compare Community/news/card rendering for present, missing, quarantined, and orphaned media.

Any mismatch remains an exception record; nothing is deleted during inventory or rehearsal.

