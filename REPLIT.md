# Replit setup for CLA Learning

## Import
1. Create a Replit Node.js Repl
2. Upload this folder (or connect the GitHub repo `Topmindmobi/cla-learning`)
3. Run `npm install`

## Secrets (Replit → Tools → Secrets)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Database
Apply migrations in order in the Supabase SQL Editor:
`001` → `008` (especially `006`, `007`, `008` if not yet applied)

## Run
Dev: `npm run replit` (binds `0.0.0.0`)
Deploy: Replit uses `npm run build` then `npm run start`
