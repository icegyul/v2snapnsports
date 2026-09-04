#!/usr/bin/env bash
set -euo pipefail

# Vite treats '#' as a URL fragment delimiter, which breaks dev/build/test
# whenever this repo checkout lives under a path containing '#' (true for
# this project's local working copy). Mirrors the root project's own
# scripts/run-vite-safe-check.sh workaround, scoped to just apps/play so
# the copy stays small and fast. On CI (no '#' in the path) this is a
# no-op and commands run in place.

task_name=${1:?dev, typecheck, test, or build is required}
shift
script_dir=$(cd "$(dirname "$0")" && pwd -P)
project_root=$(cd "$script_dir/.." && pwd -P)
runtime_root=$project_root
temporary_root=''
default_temp_parent=/private/tmp
if [[ ! -d "$default_temp_parent" ]]; then
  default_temp_parent=/tmp
fi
runtime_temp_parent=${SNAPN_PLAY_RUNTIME_TMP_ROOT:-$default_temp_parent}

cleanup() {
  if [[ -n "$temporary_root" ]]; then
    rm -rf -- "$temporary_root"
  fi
}
trap cleanup EXIT

if [[ "$project_root" == *'#'* ]]; then
  if command -v rsync >/dev/null 2>&1; then
    temporary_root=$(mktemp -d "$runtime_temp_parent/snapn-play-runtime.XXXXXX")
    rsync -a --exclude '/.git' --exclude '/dist' --exclude '/.vite' "$project_root/" "$temporary_root/"
    runtime_root=$temporary_root
  elif command -v robocopy >/dev/null 2>&1; then
    # Windows Git Bash fallback: no rsync, and a node_modules junction would
    # resolve back into the '#' path, so mirror into a persistent cache dir
    # with robocopy. Incremental after the first run; kept across runs.
    runtime_root="$runtime_temp_parent/snapn-play-runtime-cache"
    mkdir -p "$runtime_root"
    set +e
    MSYS_NO_PATHCONV=1 robocopy \
      "$(cygpath -w "$project_root")" "$(cygpath -w "$runtime_root")" \
      /MIR /R:2 /W:2 \
      /XD "$(cygpath -w "$project_root/.git")" "$(cygpath -w "$project_root/dist")" \
          "$(cygpath -w "$project_root/.vite")" \
          "$(cygpath -w "$runtime_root/dist")" "$(cygpath -w "$runtime_root/.vite")" \
      /NDL /NJH /NP > "${TEMP:-/tmp}/snapn-play-robocopy-last.log" 2>&1
    robocopy_status=$?
    set -e
    if (( robocopy_status >= 8 )); then
      printf 'robocopy mirror failed with status %s\n' "$robocopy_status" >&2
      exit 1
    fi
  else
    printf 'Neither rsync nor robocopy is available to stage a runtime copy.\n' >&2
    exit 1
  fi
fi

cd "$runtime_root"

case "$task_name" in
  dev) ./node_modules/.bin/vite "$@" ;;
  typecheck) ./node_modules/.bin/tsc --noEmit ;;
  test) ./node_modules/.bin/vitest run "$@" ;;
  build) ./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/vite build "$@" ;;
  *) printf 'Unsupported PLAY runtime task: %s\n' "$task_name" >&2; exit 2 ;;
esac
