#!/bin/bash
# protect-secrets.sh — .envや秘密情報ファイルの編集をブロック

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# ブロック対象パターン
PROTECTED_PATTERNS=(".env" ".env.local" ".env.production" ".env.development" "credentials" ".pem" ".key" ".secret")

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if [[ "$(basename "$FILE_PATH")" == *"$pattern"* ]]; then
    echo "BLOCKED: $FILE_PATH は保護対象ファイルです（パターン: $pattern）" >&2
    exit 2
  fi
done

exit 0
