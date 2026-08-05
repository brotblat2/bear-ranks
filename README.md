# Bear Ranks

**Powered by ChatBRP**

Bear Ranks is a human ranking app. Users submit exactly three items. When a ranker dashboard is open, requests enter a live queue and the user waits for the result. When no ranker is online, or a live request is unanswered for five minutes, the request is emailed to the ranker.

## Implemented

- Public three-item submission UI
- Online/offline ranker indicator
- Private `/ranker` dashboard protected by `RANKER_KEY`
- Ranker heartbeat while the dashboard is open
- Live pending queue
- Drag-and-drop ranking with mobile up/down controls
- Waiting page at `/request/[id]`
- Automatic email fallback after five minutes
- Immediate email routing when the ranker is offline
- Inbound email reply parser for orders such as `2-3-1`
- Raw numeric orders mapped back to the full submitted item text
- Result shown on the waiting page and emailed to the user

## Free services

- Next.js hosting: Vercel or another server-capable Next.js host
- Database: Supabase Free
- Sending and receiving email: Resend Free
- Source control: GitHub

GitHub Pages cannot run this application because live status, database access, and email processing require server routes.

## Setup

### 1. Supabase

Create a Supabase project, open the SQL editor, and run `supabase/schema.sql`.

Copy the project URL and server secret key. The secret key must remain server-side.

### 2. Resend

Create a Resend API key, configure a sending address, and enable Receiving. Add this webhook and select the `email.received` event:

```text
https://YOUR_DEPLOYED_SITE/api/email/inbound
```

Use your Resend receiving address as `INBOUND_EMAIL`. Ranker emails include a subject like `[BR:request-uuid]`; replies are retrieved through Resend's Receiving API and parsed by the webhook.

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in every value:

```env
SUPABASE_URL=
SUPABASE_SECRET_KEY=
RESEND_API_KEY=
RANKER_EMAIL=
FROM_EMAIL=
INBOUND_EMAIL=
RANKER_KEY=
```

### 4. Run

```bash
npm install
npm run dev
```

Open:

- User app: `http://localhost:3000`
- Ranker dashboard: `http://localhost:3000/ranker`

The ranker enters the value of `RANKER_KEY` once; it is stored locally in that browser.

## Production deployment

Import this GitHub repository into a server-capable Next.js host and add the seven environment variables. After deployment, update the Resend webhook to the production `/api/email/inbound` URL.

## Email reply format

The ranker may reply using formats such as:

```text
2-3-1
2, 3, 1
2 3 1
```

The application validates that each of 1, 2, and 3 appears once, then returns the actual item contents in that order. Users never receive only the raw numbers.
