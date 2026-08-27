# Community Security Report

## Verdict

**Status: `FAIL`**

## Confirmed findings

1. New free-board text is HTML-escaped server-side before storage.
2. New comments are escaped and later stripped of tags.
3. Card HTML is server-constructed and path-restricted.
4. The frontend renders post and news HTML through `dangerouslySetInnerHTML`.
5. Historical/Rhymix/news HTML is not passed through a proven allowlist sanitizer.
6. `news.php` removes selected color/border styles but does not sanitize tags, event attributes, URLs, SVG, or script-capable constructs.
7. Sampled app/API responses did not include a Content Security Policy; other common hardening headers were also not observed.
8. The authentication token is stored in localStorage, increasing the impact of stored XSS.
9. Free-board report, hide, moderation, block, mute, and audience controls were not found.
10. Upload validation checks size and magic bytes but does not decode/re-encode, strip EXIF, scan malware, or enforce ownership at file-serving time.

## Mandatory safety fixes before V2 rendering

- Use one reviewed HTML sanitizer with an explicit tag/attribute/URL allowlist and versioned fixtures.
- Reject scripts, event handlers, unsafe schemes, SVG/MathML attack surface unless explicitly supported, CSS injection, forms, iframes, and active embeds.
- Sanitize historical post/news/card fixtures before render; preserve original only in protected evidence/legacy source.
- Deploy CSP with nonces/hashes as applicable, `object-src 'none'`, restrictive `base-uri`, `frame-ancestors`, and controlled image/media/connect sources.
- Add HSTS, nosniff, referrer, permissions, and frame policy appropriate to the hosting topology.
- Keep tokens out of HTML and logs; complete the V2 session design.
- Rate-limit write/like/comment/report paths and add abuse audit.
- Validate uploaded images by decoding/re-encoding and strip metadata.

## Required XSS fixtures

Script tags, mixed-case/event attributes, encoded schemes, malformed nesting, CSS URLs, SVG/MathML, iframe/object/embed, data URLs, external links, historical tables/images, broken media paths, and oversized input must all have expected sanitized outputs.

No exploit payload was submitted to production during this audit.

