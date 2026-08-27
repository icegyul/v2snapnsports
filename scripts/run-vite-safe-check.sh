#!/usr/bin/env bash
set -euo pipefail

task_name=${1:?dev, typecheck, lint, test, or build is required}
shift
script_dir=$(cd "$(dirname "$0")" && pwd -P)
project_root=$(cd "$script_dir/.." && pwd -P)
runtime_root=$project_root
temporary_root=''

cleanup() {
  if [[ -n "$temporary_root" ]]; then
    rm -rf -- "$temporary_root"
  fi
}
trap cleanup EXIT

if [[ "$project_root" == *'#'* ]]; then
  temporary_root=$(mktemp -d /private/tmp/snapn-v2-runtime.XXXXXX)
  rsync -a --exclude '/.git' --exclude '/dist' --exclude '/.vite' "$project_root/" "$temporary_root/"
  runtime_root=$temporary_root
fi

cd "$runtime_root"

case "$task_name" in
  dev) ./node_modules/.bin/vite "$@" ;;
  typecheck) ./node_modules/.bin/tsc --noEmit ;;
  lint) ./node_modules/.bin/eslint . ;;
  test) ./node_modules/.bin/vitest run "$@" ;;
  build) ./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/vite build "$@" ;;
  *) printf 'Unsupported V2 runtime task: %s\n' "$task_name" >&2; exit 2 ;;
esac
