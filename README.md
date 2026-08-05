# Bear Ranks

**Powered by ChatBRP**

A ChatGPT-inspired three-item submission interface. A user submits exactly three items and their email address. The three items are emailed to a human ranker, with the user's address set as `Reply-To`, so the ranker can respond directly with the final order.

## MVP behavior

- Three required item fields
- No ranking criteria
- No rationale requested
- Human ranker chooses the basis
- User receives the result by email
- Bear-themed responsive UI

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open `http://localhost:3000`.

## Email configuration

Create a [Resend](https://resend.com) account and set:

```env
RESEND_API_KEY=re_xxxxxxxxx
RANKER_EMAIL=ranker@example.com
FROM_EMAIL=Bear Ranks <rankings@yourdomain.com>
```

For production, verify the sending domain in Resend. The submission email uses the user's email as `Reply-To`, so pressing Reply sends the ranking to the correct person.

## Deploy

Deploy to Vercel and add the same three environment variables in the project settings. No database is required for this MVP.
