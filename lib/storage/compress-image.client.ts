"use client"

export type ImageCompressionSettings = {
  maxWidthOrHeight: number
  quality: number
  outputType: "image/webp" | "image/jpeg"
  /** When true, return the original file (for CMS masters and GIF). */
  skipCompression?: boolean
}

export type ImageCompressionOptions = Partial<ImageCompressionSettings>

/**
 * Named presets for common upload contexts.
 * Pick one per feature instead of duplicating numbers across the app.
 */
export const IMAGE_COMPRESSION_PRESETS = {
  /** Account avatars, small profile images. */
  avatar: {
    maxWidthOrHeight: 1024,
    quality: 0.82,
    outputType: "image/webp",
  },
  /** Product grid cards, category tiles, cart thumbnails. */
  productCard: {
    maxWidthOrHeight: 800,
    quality: 0.8,
    outputType: "image/webp",
  },
  /** Product detail gallery, zoom-friendly storefront images. */
  productGallery: {
    maxWidthOrHeight: 2048,
    quality: 0.85,
    outputType: "image/webp",
  },
  /** CMS hero banners, landing sections, wide editorial images. */
  cmsHero: {
    maxWidthOrHeight: 2560,
    quality: 0.88,
    outputType: "image/webp",
  },
  /**
   * CMS media library master upload.
   * Skips client compression — pair with server-side derivatives (Sharp, etc.).
   */
  cmsMaster: {
    maxWidthOrHeight: 4096,
    quality: 0.92,
    outputType: "image/jpeg",
    skipCompression: true,
  },
} as const satisfies Record<string, ImageCompressionSettings>

export type ImageCompressionPreset = keyof typeof IMAGE_COMPRESSION_PRESETS

/** @deprecated Use IMAGE_COMPRESSION_PRESETS.avatar or pass preset name. */
export const IMAGE_COMPRESSION_DEFAULTS = IMAGE_COMPRESSION_PRESETS.avatar

const COMPRESSIBLE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
])

function outputExtension(contentType: "image/webp" | "image/jpeg") {
  return contentType === "image/webp" ? "webp" : "jpg"
}

function scaledDimensions(
  width: number,
  height: number,
  maxWidthOrHeight: number
) {
  if (width <= maxWidthOrHeight && height <= maxWidthOrHeight) {
    return { width, height }
  }

  if (width >= height) {
    return {
      width: maxWidthOrHeight,
      height: Math.round((height / width) * maxWidthOrHeight),
    }
  }

  return {
    width: Math.round((width / height) * maxWidthOrHeight),
    height: maxWidthOrHeight,
  }
}

export function resolveImageCompressionSettings(
  input?: ImageCompressionPreset | ImageCompressionOptions
): ImageCompressionSettings {
  if (!input) {
    return IMAGE_COMPRESSION_PRESETS.avatar
  }

  if (typeof input === "string") {
    return IMAGE_COMPRESSION_PRESETS[input]
  }

  return {
    ...IMAGE_COMPRESSION_PRESETS.avatar,
    ...input,
  }
}

/**
 * Resize and re-encode an image in the browser before storage upload.
 * GIF files pass through unchanged so animation is preserved.
 */
export async function compressImageForUpload(
  file: File,
  presetOrOptions?: ImageCompressionPreset | ImageCompressionOptions
): Promise<File> {
  const settings = resolveImageCompressionSettings(presetOrOptions)

  if (settings.skipCompression || !COMPRESSIBLE_IMAGE_TYPES.has(file.type)) {
    return file
  }

  const bitmap = await createImageBitmap(file)
  const { width, height } = scaledDimensions(
    bitmap.width,
    bitmap.height,
    settings.maxWidthOrHeight
  )

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext("2d")
  if (!context) {
    bitmap.close()
    throw new Error("Image compression is not supported in this browser")
  }

  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result)
          return
        }
        reject(new Error("Image compression failed"))
      },
      settings.outputType,
      settings.quality
    )
  })

  const baseName = file.name.replace(/\.[^.]+$/, "") || "upload"
  const extension = outputExtension(settings.outputType)

  return new File([blob], `${baseName}.${extension}`, {
    type: settings.outputType,
    lastModified: Date.now(),
  })
}
