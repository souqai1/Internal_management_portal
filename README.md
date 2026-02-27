# SouqAI Admin Panel

Internal tool onboarding and review system for SouqAI.ai.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS → deployed on Vercel
- **Backend**: Supabase Edge Functions (TypeScript/Deno) → deployed via Supabase CLI
- **Database**: Supabase PostgreSQL

## How It Works

1. **Make.com** sends batches of tool IDs to the `webhook-tools` Edge Function
2. A **review ticket** is created with all the tools
3. Admin logs into the panel, reviews each tool (Yes/No toggle)
4. **Save** persists draft decisions, **Approve** sets selected tools live in `tools_validation`

## Edge Functions

| Function | Purpose |
|---|---|
| `webhook-tools` | Receives tool IDs from Make.com, creates a review ticket |
| `list-tickets` | Returns all tickets (pending first) |
| `get-ticket` | Returns ticket details with full tool data |
| `save-decisions` | Saves draft Yes/No decisions |
| `approve-ticket` | Applies decisions, sets tools live, locks ticket |

## Database Tables

- `review_tickets` — batch metadata (status, tool_count, timestamps)
- `review_ticket_items` — individual tool decisions per ticket
- `tools_raw`, `tools_validation`, `tools_criteria` — existing tool data

## Local Development

```bash
cd frontend
npm install
npm run dev
```

Requires `frontend/.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Deploying Edge Functions

```bash
supabase login --token YOUR_TOKEN
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy list-tickets --no-verify-jwt
supabase functions deploy get-ticket --no-verify-jwt
supabase functions deploy save-decisions --no-verify-jwt
supabase functions deploy approve-ticket --no-verify-jwt
supabase functions deploy webhook-tools --no-verify-jwt
```

## Make.com Webhook

```
POST https://YOUR_PROJECT.supabase.co/functions/v1/webhook-tools
Headers: x-api-key: YOUR_WEBHOOK_KEY
Body: {"tool_ids": "394,395,396"}
```
