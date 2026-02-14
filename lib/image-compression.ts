/**
 * Client-side image compression utility
 * Compresses images to stay under UploadThing's free tier limit (2MB)
 * while maintaining good quality
 */

interface CompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  quality?: number
}

/**
 * Compress an image file using canvas
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxSizeMB = 1.8, // Stay safely under 2MB
    maxWidthOrHeight = 1920,
    quality = 0.8,
  } = options

  // If file is already small enough, return as is
  if (file.size <= maxSizeMB * 1024 * 1024) {
    return file
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
          if (width > height) {
            height = (height / width) * maxWidthOrHeight
            width = maxWidthOrHeight
          } else {
            width = (width / height) * maxWidthOrHeight
            height = maxWidthOrHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        // Use better quality settings
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        // Try to achieve target size by adjusting quality
        let currentQuality = quality
        const attemptCompression = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not create blob'))
                return
              }

              // If still too large and quality can be reduced, try again
              if (blob.size > maxSizeMB * 1024 * 1024 && currentQuality > 0.4) {
                currentQuality -= 0.1
                attemptCompression()
                return
              }

              // Create new file with compressed data
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })

              console.log(
                `Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
              )

              resolve(compressedFile)
            },
            'image/jpeg',
            currentQuality
          )
        }

        attemptCompression()
      }

      img.onerror = () => {
        reject(new Error('Could not load image'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Could not read file'))
    }
  })
}

/**
 * Compress multiple images
 * @param files - Array of image files
 * @param options - Compression options
 * @param onProgress - Progress callback
 * @returns Array of compressed files
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (current: number, total: number) => void
): Promise<File[]> {
  const compressedFiles: File[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    try {
      const compressedFile = await compressImage(file, options)
      compressedFiles.push(compressedFile)
    } catch (error) {
      console.error(`Failed to compress ${file.name}:`, error)
      // Use original file if compression fails
      compressedFiles.push(file)
    }

    if (onProgress) {
      onProgress(i + 1, files.length)
    }
  }

  return compressedFiles
}

/**
 * Create a thumbnail from an image file
 * @param file - The image file
 * @param maxSize - Maximum width/height for thumbnail
 * @returns Thumbnail as data URL
 */
export async function createThumbnail(
  file: File,
  maxSize: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        if (width > height) {
          height = (height / width) * maxSize
          width = maxSize
        } else {
          width = (width / height) * maxSize
          height = maxSize
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }

      img.onerror = () => reject(new Error('Could not load image'))
    }

    reader.onerror = () => reject(new Error('Could not read file'))
  })
}
