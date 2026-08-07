# Cloudflare Storage Setup

Step-by-step guide for Cloudflare R2 in this project. Read
`docs/TECHNOLOGY_STACK.md` for stack rules. This file covers account, bucket,
credentials, CORS, and local env wiring.

## How this app uses R2

- Upload: browser gets a short-lived **presigned PUT** URL, uploads directly to
  R2 (`*.r2.cloudflarestorage.com`).
- Store: PostgreSQL keeps the **object key** only (for example
  `users/{userId}/{id}.png`), not a public CDN URL.
- Read: server returns a short-lived **presigned GET** URL so the browser loads
  the file from Cloudflare.

Do **not** use the `r2.dev` Public Development URL for this app. Leave it
disabled. Signed URLs are the supported read path.

Relevant code:

- `lib/storage/r2.server.ts` — S3 client, presign upload/download
- `lib/storage/upload.action.ts` — authenticated upload-intent action
- `lib/storage/client.storage.ts` — client PUT after intent
- `lib/storage/object-path.ts` — key normalization helpers

## 1. Create an R2 bucket

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2 Object Storage**.
2. Enable R2 if prompted (billing setup required even on free allowance).
3. **Create bucket** (example name: `testing-storage` or `app-uploads`).
4. Note the bucket name for `R2_BUCKET`.

## 2. Create API credentials

1. R2 overview → **Manage R2 API Tokens** (or Account API Tokens with R2
   permissions).
2. Create a token with at least:
   - Object Read
   - Object Write
   - (Optional) Object Delete if you will implement deletes
3. Copy and store securely:
   - **Access Key ID** → `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `R2_SECRET_ACCESS_KEY`
4. Copy your **Account ID** from the R2 overview sidebar → `R2_ACCOUNT_ID`.

Never commit these values. Put them only in `.env` / Vercel env settings.

## 3. Set the S3 endpoint

```dotenv
R2_ENDPOINT="https://<ACCOUNT_ID>.r2.cloudflarestorage.com"
```

Replace `<ACCOUNT_ID>` with the same value as `R2_ACCOUNT_ID`.

## 4. Configure CORS (required for browser uploads)

Presigned uploads are `PUT` from the browser origin (local or production).
Without CORS, the browser blocks the request.

1. Open the bucket → **Settings** → **CORS Policy**.
2. Add a policy like:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

3. For deployed apps, add each real origin (preview + production), for example:

```json
"AllowedOrigins": [
  "http://localhost:3000",
  "https://your-app.vercel.app",
  "https://your-production-domain.com"
]
```

## 5. Public Development URL (`r2.dev`)

Leave **Public Development URL** disabled.

This project does not use `pub-….r2.dev`. That hostname is rate-limited, not
meant for production, and can fail DNS resolution. Reads use signed GET URLs
on `*.r2.cloudflarestorage.com` instead.

## 6. Environment variables

Add to `.env` (from `.env.example`):

```dotenv
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET=""
R2_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
```

| Variable | Source |
| --- | --- |
| `R2_ACCOUNT_ID` | R2 overview → Account ID |
| `R2_ACCESS_KEY_ID` | R2 API token |
| `R2_SECRET_ACCESS_KEY` | R2 API token (shown once) |
| `R2_BUCKET` | Bucket name |
| `R2_ENDPOINT` | `https://{accountId}.r2.cloudflarestorage.com` |

Restart `bun dev` after changing env values.

In Vercel, set the same keys for Development, Preview, and Production. Prefer a
separate bucket or key prefix for Preview.

## 7. Verify local setup

1. `bun dev`
2. Sign in → **Account** → upload a profile image.
3. Confirm Network tab:
   - App action `createUploadIntent` returns `uploadUrl` + `key`.
   - Browser `PUT` to `*.r2.cloudflarestorage.com` succeeds (CORS OK).
   - Profile/avatar `src` is a signed GET URL on the same R2 host (not
     `r2.dev`).
4. Object appears in the Cloudflare bucket under `users/{userId}/…`.
5. Database `user.image` stores the object **key**, not a public URL.

## Current app limits

Defined in `lib/storage/upload.action.ts`:

- Max size: 5 MB
- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Object key prefix: `users/{authenticatedUserId}/…`

Change those limits in code when product needs differ. Keep validation on the
server before signing.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| CORS / preflight fail on PUT | Missing or wrong CORS origins | Add `http://localhost:3000` (and deploy origins) to bucket CORS |
| `403` on PUT after CORS fixed | Signed headers / checksum mismatch | Use current `r2.server.ts` (checksum when required; sign `content-type` only) |
| Image never loads / DNS error on `r2.dev` | Using Public Development URL | Disable `r2.dev`; rely on signed GET (current code path) |
| Upload intent fails auth | No session | Sign in first; intent action requires auth |
| Env validation error | Missing R2 vars | Fill all five `R2_*` keys in `.env` |

## Security checklist

- [ ] R2 secrets only in server env (never `NEXT_PUBLIC_*`)
- [ ] `.env` gitignored; `.env.example` has empty placeholders only
- [ ] CORS origins are explicit (no production `*` if avoidable)
- [ ] Public Development URL disabled
- [ ] Object keys are server-generated and scoped under the user id
- [ ] Signed URLs are short-lived; DB stores keys only

## Reference

- [Cloudflare R2 docs](https://developers.cloudflare.com/r2/)
- [R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/)
- [R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- Project stack: `docs/TECHNOLOGY_STACK.md`
