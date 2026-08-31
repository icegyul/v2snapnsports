#!/usr/bin/env bash
set -euo pipefail

SOURCE_ROOT="${1:-/private/tmp/snapn-stadium-service-visual}"
INTEGRATION_ROOT="${2:-/Volumes/700gb/## APP/Sanpnsports v2_app}"
DEST_PARENT="${3:-/Volumes/700gb/## APP/Sanpnsports v2_app/V2}"

PACKAGE_NAME="SNAPN_SPORTS_V2_STADIUM_CLAUDE_CODE_FULL_HANDOFF_2026-08-31"
STAGING_NAME=".SNAPN_CLAUDE_HANDOFF_STAGING_2026-08-31"
STAGING_ROOT="$DEST_PARENT/$STAGING_NAME"
PACKAGE_ROOT="$STAGING_ROOT/$PACKAGE_NAME"
READY_REPO="$STAGING_ROOT/snapn-stadium-claude-ready"
DEST_DIR="$DEST_PARENT/$PACKAGE_NAME"
DEST_ZIP="$DEST_PARENT/$PACKAGE_NAME.zip"
DEST_ZIP_SHA="$DEST_PARENT/$PACKAGE_NAME.zip.sha256"
ORIGINAL_ZIP="$INTEGRATION_ROOT/V2/SNAPN_SPORTS_V2_STADIUM_FULL_HANDOFF_2026-08-30.zip"

if [[ ! -d "$SOURCE_ROOT" || ! -d "$INTEGRATION_ROOT" ]]; then
  echo "SOURCE_OR_INTEGRATION_ROOT_MISSING" >&2
  exit 2
fi

if [[ -e "$STAGING_ROOT" || -e "$DEST_DIR" || -e "$DEST_ZIP" || -e "$DEST_ZIP_SHA" ]]; then
  echo "HANDOFF_TARGET_ALREADY_EXISTS" >&2
  exit 3
fi

for required in git rsync tar zip unzip shasum npm find sort; do
  command -v "$required" >/dev/null
done

mkdir -p "$STAGING_ROOT"
mkdir -p "$PACKAGE_ROOT/HANDOFF" "$PACKAGE_ROOT/ORIGINAL_HANDOFF" "$PACKAGE_ROOT/ARCHIVES" "$PACKAGE_ROOT/GIT" "$PACKAGE_ROOT/STATE"

git clone --no-hardlinks --branch codex/stadium-commercial-finish "$INTEGRATION_ROOT" "$READY_REPO"
rsync -a --exclude='.git' "$SOURCE_ROOT/" "$READY_REPO/"

cp "$SOURCE_ROOT/README_FIRST_CLAUDE_CODE_KO.md" "$PACKAGE_ROOT/README_FIRST_CLAUDE_CODE_KO.md"
cp "$SOURCE_ROOT/HANDOFF/UPDATE_REASON_AND_FAILURE_RECORD_KO.md" "$PACKAGE_ROOT/HANDOFF/"
cp "$SOURCE_ROOT/HANDOFF/CLAUDE_CODE_DEVELOPMENT_DIRECTIVE_KO.md" "$PACKAGE_ROOT/HANDOFF/"
cp "$SOURCE_ROOT/HANDOFF/CLAUDE_CODE_HANDOFF_KO.md" "$PACKAGE_ROOT/HANDOFF/"
cp "$SOURCE_ROOT/HANDOFF/API_AND_PASSWORD_LOCATION_GUIDE_KO.md" "$PACKAGE_ROOT/HANDOFF/"

cp "$ORIGINAL_ZIP" "$PACKAGE_ROOT/ARCHIVES/ORIGINAL_STADIUM_HANDOFF_2026-08-30.zip"
unzip -p "$ORIGINAL_ZIP" '*/README_FIRST_KO.md' > "$PACKAGE_ROOT/ORIGINAL_HANDOFF/README_FIRST_KO.md"
unzip -p "$ORIGINAL_ZIP" '*/HANDOFF/DEVELOPMENT_DIRECTIVE_KO.md' > "$PACKAGE_ROOT/ORIGINAL_HANDOFF/DEVELOPMENT_DIRECTIVE_KO.md"
unzip -p "$ORIGINAL_ZIP" '*/HANDOFF/CURRENT_STATUS_KO.md' > "$PACKAGE_ROOT/ORIGINAL_HANDOFF/CURRENT_STATUS_KO.md"

git -C "$READY_REPO" branch --show-current > "$PACKAGE_ROOT/STATE/SOURCE_BRANCH.txt"
git -C "$READY_REPO" rev-parse HEAD > "$PACKAGE_ROOT/STATE/SOURCE_HEAD.txt"
git -C "$READY_REPO" status --short --untracked-files=all > "$PACKAGE_ROOT/STATE/SOURCE_GIT_STATUS.txt"
git -C "$READY_REPO" ls-files | LC_ALL=C sort > "$PACKAGE_ROOT/STATE/SOURCE_TRACKED_FILES.txt"
(cd "$READY_REPO" && find . -type f -print | LC_ALL=C sort) > "$PACKAGE_ROOT/STATE/SOURCE_ALL_FILES.txt"
git -C "$READY_REPO" diff --binary HEAD > "$PACKAGE_ROOT/STATE/SOURCE_WORKTREE_PATCH.diff"
git -C "$READY_REPO" diff --stat HEAD > "$PACKAGE_ROOT/STATE/SOURCE_DIFF_STAT.txt"
git -C "$READY_REPO" log -100 --date=iso-strict --pretty=format:'%H%x09%ad%x09%an%x09%s' > "$PACKAGE_ROOT/STATE/RECENT_100_COMMITS.txt"

git -C "$INTEGRATION_ROOT" branch --show-current > "$PACKAGE_ROOT/STATE/INTEGRATION_BRANCH.txt"
git -C "$INTEGRATION_ROOT" rev-parse HEAD > "$PACKAGE_ROOT/STATE/INTEGRATION_HEAD.txt"
git -C "$INTEGRATION_ROOT" status --short --untracked-files=all > "$PACKAGE_ROOT/STATE/INTEGRATION_GIT_STATUS.txt"
(cd "$INTEGRATION_ROOT" && find . -type f -not -path "./V2/$STAGING_NAME/*" -print | LC_ALL=C sort) > "$PACKAGE_ROOT/STATE/INTEGRATION_ALL_FILES.txt"

{
  echo "Credential-like filenames only. Secret values were not printed."
  find "$READY_REPO" -type f \( -name '.env*' -o -iname '*secret*' -o -iname '*credential*' -o -iname '*password*' -o -name '*.pem' -o -name '*.key' -o -name '*.p12' -o -name '*.pfx' \) -not -path '*/node_modules/*' -not -path '*/.git/*' -print | LC_ALL=C sort
} > "$PACKAGE_ROOT/STATE/CREDENTIAL_LOCATION_SCAN.txt"

{
  echo "NODE=$(node --version)"
  echo "NPM=$(npm --version)"
  echo "SOURCE_BRANCH=$(git -C "$READY_REPO" branch --show-current)"
  echo "SOURCE_HEAD=$(git -C "$READY_REPO" rev-parse HEAD)"
  echo "INTEGRATION_BRANCH=$(git -C "$INTEGRATION_ROOT" branch --show-current)"
  echo "INTEGRATION_HEAD=$(git -C "$INTEGRATION_ROOT" rev-parse HEAD)"
  echo "PLAINTEXT_SECRET_VALUES_COPIED=NO"
} > "$PACKAGE_ROOT/STATE/ENVIRONMENT_SUMMARY.txt"

(
  cd "$READY_REPO"
  echo "[typecheck]"
  npm run typecheck
  echo "[tests]"
  npm test -- --run
  echo "[build]"
  npm run build
  echo "[lint]"
  npm run lint
  echo "[diff-check]"
  git diff --check
) > "$PACKAGE_ROOT/STATE/VERIFICATION_RESULT.txt" 2>&1

git -C "$INTEGRATION_ROOT" bundle create "$PACKAGE_ROOT/GIT/SNAPN_SPORTS_ALL_REFS.bundle" --all
git bundle verify "$PACKAGE_ROOT/GIT/SNAPN_SPORTS_ALL_REFS.bundle" > "$PACKAGE_ROOT/STATE/GIT_BUNDLE_VERIFY.txt" 2>&1

tar -czf "$PACKAGE_ROOT/ARCHIVES/STADIUM_CLAUDE_READY_REPO_FULL.tar.gz" -C "$STAGING_ROOT" "$(basename "$READY_REPO")"
tar --exclude="$(basename "$INTEGRATION_ROOT")/V2/$STAGING_NAME" -czf "$PACKAGE_ROOT/ARCHIVES/INTEGRATION_DIRTY_CHECKOUT_FULL.tar.gz" -C "$(dirname "$INTEGRATION_ROOT")" "$(basename "$INTEGRATION_ROOT")"

tar -tzf "$PACKAGE_ROOT/ARCHIVES/STADIUM_CLAUDE_READY_REPO_FULL.tar.gz" >/dev/null
tar -tzf "$PACKAGE_ROOT/ARCHIVES/INTEGRATION_DIRTY_CHECKOUT_FULL.tar.gz" >/dev/null
unzip -t "$PACKAGE_ROOT/ARCHIVES/ORIGINAL_STADIUM_HANDOFF_2026-08-30.zip" > "$PACKAGE_ROOT/STATE/ORIGINAL_ZIP_VERIFY.txt"

(cd "$PACKAGE_ROOT" && find . -type f ! -name 'SHA256SUMS.txt' -print | LC_ALL=C sort > STATE/PACKAGE_CONTENTS.txt)
(cd "$PACKAGE_ROOT" && while IFS= read -r item; do shasum -a 256 "$item"; done < STATE/PACKAGE_CONTENTS.txt > SHA256SUMS.txt)
(cd "$PACKAGE_ROOT" && shasum -a 256 -c SHA256SUMS.txt >/dev/null)

mv "$PACKAGE_ROOT" "$DEST_DIR"
(cd "$DEST_PARENT" && zip -0 -r "$DEST_ZIP" "$PACKAGE_NAME" >/dev/null)
unzip -t "$DEST_ZIP" >/dev/null
shasum -a 256 "$DEST_ZIP" > "$DEST_ZIP_SHA"

case "$STAGING_ROOT" in
  "$DEST_PARENT"/.SNAPN_CLAUDE_HANDOFF_STAGING_*) rm -rf "$STAGING_ROOT" ;;
  *) echo "UNSAFE_STAGING_PATH" >&2; exit 4 ;;
esac

echo "$DEST_DIR"
echo "$DEST_ZIP"
echo "$DEST_ZIP_SHA"
