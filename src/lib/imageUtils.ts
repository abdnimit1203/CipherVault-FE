import imageCompression from "browser-image-compression";

/**
 * Downscales and compresses an uploaded image file on the browser before uploading.
 * Max dimensions: 300x300px
 * Target max size: ~30KB
 */
export async function compressAndDownscaleImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.05, // 50 KB max
    maxWidthOrHeight: 300,
    useWebWorker: true,
    fileType: "image/jpeg",
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error("browser-image-compression error, using fallback canvas compression:", error);
    return await fallbackCanvasDownscale(file, 300, 300);
  }
}

/**
 * Fallback Canvas Downscaler
 */
function fallbackCanvasDownscale(file: File, maxWidth: number, maxHeight: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return resolve(file);
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        0.85
      );
    };

    img.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
