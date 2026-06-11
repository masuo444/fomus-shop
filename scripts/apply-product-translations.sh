#!/bin/bash
# Apply English product translations to Supabase via PostgREST.
# Prerequisite: run supabase/migrations/041_product_english.sql in the SQL Editor first.
set -euo pipefail
cd "$(dirname "$0")/.."

export $(grep -E "^(NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY)" .env.local | xargs)

python3 - <<'EOF'
import json, os, urllib.request

url = os.environ['NEXT_PUBLIC_SUPABASE_URL']
key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
translations = json.load(open('scripts/product-translations-en.json'))

for slug, fields in translations.items():
    body = json.dumps(fields).encode()
    req = urllib.request.Request(
        f"{url}/rest/v1/products?slug=eq.{slug}",
        data=body, method='PATCH',
        headers={
            'apikey': key,
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
        })
    with urllib.request.urlopen(req) as res:
        updated = json.loads(res.read())
        status = 'OK ' if updated else 'SKIP(該当なし)'
        print(f"{status} {slug} -> {fields['name_en']}")
EOF
