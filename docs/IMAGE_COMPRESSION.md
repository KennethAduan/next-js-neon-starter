# Image Compression Before Storage Upload

Guide for client-side image compression before upload to object storage
(Cloudflare R2, S3, or any presigned PUT flow). Copy this file into other
projects when you use the same upload pattern.

## Why compress before upload

Large camera photos upload slowly and cost more to store and serve. Most
storefront and CMS images do not need full sensor resolution in the browser
upload step.

Compress in the browser before you request an upload URL. The server signs the
upload for the final byte size and content type. If you compress after signing,
the upload fails or stores the wrong object.

For ecommerce and CMS apps, treat client compression as **layer 1** (upload
gate). Add server-side derivatives and CDN resizing as later layers.

## Where compression runs in this project

| Step | Location | Role |
| --- | --- | --- |
| Compress | `lib/storage/compress-image.client.ts` | Resize and re-encode in browser |
| Upload | `lib/storage/client.storage.ts` | Compress, then presigned PUT |
| Validate | `lib/storage/upload.action.ts` | Auth, type allow-list, 5 MB cap |
| Store | R2 via `lib/storage/r2.server.ts` | Object storage |

Default flow for profile photos: **Account** page → `uploadFile()` with
`compression: "avatar"` → `compressImageForUpload()` →
`createUploadIntentAction()` → browser PUT to R2.

## Named presets

Defined in `IMAGE_COMPRESSION_PRESETS` inside
`lib/storage/compress-image.client.ts`. Use a preset per feature instead of
copying numbers across forms.

| Preset | Max edge | Quality | Output | Use for |
| --- | --- | --- | --- | --- |
| `avatar` | 1024 | 0.82 | WebP | Account profile, staff photo |
| `productCard` | 800 | 0.80 | WebP | Grid cards, category tiles, cart thumb |
| `productGallery` | 2048 | 0.85 | WebP | PDP gallery, zoom-friendly product image |
| `cmsHero` | 2560 | 0.88 | WebP | Hero banners, landing sections |
| `cmsMaster` | - | - | - | Skip client compress; upload original |

`cmsMaster` sets `skipCompression: true`. Use it when the CMS stores a full
master file and a background worker (Sharp, queue job) creates thumbnails and
responsive variants later.

## Ecommerce and CMS strategy (3 layers)

| Layer | When | Tooling |
| --- | --- | --- |
| **1. Client gate** | User picks file in browser | `IMAGE_COMPRESSION_PRESETS` (this file) |
| **2. Server derivatives** | After upload completes | Sharp worker, queue, or serverless job |
| **3. CDN on read** | Page render | Cloudflare Images, imgproxy, or signed resize params |

Layer 1 alone is enough for a starter template. Ecommerce and CMS products
should plan for layers 2 and 3 before launch:

- **Storefront:** upload `productGallery` preset to R2, then generate
  `thumb`, `card`, and `zoom` keys server-side from that object.
- **CMS:** upload `cmsMaster` without client compression, then derive WebP/JPEG
  sizes for the editor and public site.
- **Do not** rely on one global WebP default for every upload context.

### Suggested mapping by feature

| Feature | Preset | Server follow-up |
| --- | --- | --- |
| User avatar | `avatar` | None |
| Product listing image | `productCard` | Optional 2x retina variant |
| Product detail image | `productGallery` | Generate thumb + zoom variants |
| CMS hero | `cmsHero` | Optional mobile crop variant |
| CMS media library | `cmsMaster` | Required multi-size derivatives |

Raise `MAX_UPLOAD_BYTES` in `lib/storage/upload.action.ts` when you add
`cmsMaster` uploads. The starter cap is 5 MB. CMS masters often need 10-20 MB.

### When to add an external library

Native Canvas is enough for layer 1 in most projects. Add a library when you
hit a real product gap:

| Gap | Library direction |
| --- | --- |
| iPhone HEIC uploads in CMS | `heic2any` or `browser-image-compression` |
| Consistent encode across browsers | Server Sharp after upload |
| Many responsive sizes | Sharp worker or CDN image service |
| Animated GIF optimization | Server tool; keep `compress: false` client-side |

## Supported input types

Compression runs for:

- `image/jpeg`
- `image/png`
- `image/webp`

These types pass through unchanged:

- `image/gif` (animation is preserved)
- Any non-image file
- Any preset with `skipCompression: true` (for example `cmsMaster`)

The server allow-list in `lib/storage/upload.action.ts` must include your
output type. WebP is already allowed in this starter.

## Use in code

### Preset by upload context (recommended)

```typescript
import { uploadFile } from "@/lib/storage/client.storage"

// Account profile (current starter)
await uploadFile(file, path, { compression: "avatar" })

// Ecommerce product form
await uploadFile(file, path, { compression: "productGallery" })

// CMS media library master
await uploadFile(file, path, { compression: "cmsMaster" })
```

### Automatic compression (default preset)

```typescript
await uploadFile(file, path)
```

When `compression` is omitted, `avatar` preset applies.

### Custom overrides on top of a preset

```typescript
await uploadFile(file, path, {
  compression: {
    maxWidthOrHeight: 1200,
    quality: 0.78,
    outputType: "image/jpeg",
  },
})
```

### Skip compression explicitly

```typescript
await uploadFile(file, path, { compress: false })
```

Use for GIF uploads or when the file is already prepared.

### Standalone helper

```typescript
import {
  compressImageForUpload,
  IMAGE_COMPRESSION_PRESETS,
} from "@/lib/storage/compress-image.client"

const prepared = await compressImageForUpload(originalFile, "productCard")
console.log(prepared.size, prepared.type)

// Inspect preset values
console.log(IMAGE_COMPRESSION_PRESETS.productGallery)
```

## Client-side vs server-side

| Approach | Good for | Notes |
| --- | --- | --- |
| **Client-side (this project)** | User-selected files, presigned PUT | Saves bandwidth. User device does the work. |
| **Server-side (Sharp, etc.)** | CMS masters, variant generation | Needs worker or upload route beyond presigned PUT only. |
| **CDN / image worker on read** | Responsive `srcset` from one master | Does not reduce upload size of the original. |

For presigned direct-to-storage uploads, client-side compression is the
correct first step. Add server-side or on-read transforms when the product
needs multiple sizes or CMS-quality masters.

## Presigned upload constraint

`createUploadIntentAction` sends `contentLength` and `contentType` to the
server before signing. The browser PUT must match those values.

Order must stay:

1. User selects file
2. Compress (if enabled for the preset)
3. Request upload intent with **prepared** size and type
4. PUT prepared bytes to storage

Do not sign first and compress second.

## Verify locally

1. Run `bun dev` and sign in.
2. Open **Account** and upload a large phone photo (often 3-8 MB).
3. In DevTools **Network**:
   - Confirm `createUploadIntent` `contentLength` is smaller than the
     original file.
   - Confirm the PUT body size matches that `contentLength`.
   - Confirm `Content-Type` is `image/webp` for JPEG/PNG inputs.
4. Confirm the avatar loads from a signed GET URL.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Upload intent fails after compress | Output over 5 MB | Lower preset edge/quality or raise server cap |
| Upload intent type error | Output type not in server allow-list | Add type to `ALLOWED_IMAGE_TYPES` or use allowed output |
| GIF lost animation | Compression ran on GIF | Pass `compress: false` |
| CMS master looks soft | Wrong preset | Use `cmsMaster` or `compress: false` |
| iPhone photo fails in CMS | HEIC not supported by Canvas | Add HEIC conversion library or server ingest |
| Image looks soft on PDP | `productCard` used for gallery | Switch to `productGallery` |

## Reuse in other projects

1. Copy `lib/storage/compress-image.client.ts`.
2. Pick a preset per upload form (`avatar`, `productCard`, etc.).
3. Call `compressImageForUpload` before any presigned upload (or wrap your
   existing upload helper like `uploadFile`).
4. Sign the upload with the **prepared** file size and MIME type.
5. Keep a server max-size check even after client compression.
6. Add server derivatives for ecommerce/CMS before production launch.

Related: `docs/CLOUDFLARE_STORAGE_SETUP.md` for R2 bucket, CORS, and env setup.

## Reference

- [createImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/createImageBitmap)
- [Canvas toBlob](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob)
- [WebP support](https://caniuse.com/webp)
