import axios from "axios";

/**
 * Uploads a compressed image file/blob to ImgBB API
 * @param imageFile The downscaled/compressed File object
 * @returns The hosted image URL (display_url)
 */
export async function uploadToImgBB(imageFile: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  
  if (!apiKey) {
    throw new Error("ImgBB API key (NEXT_PUBLIC_IMGBB_API_KEY) is missing in environment variables.");
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (response.data && response.data.data && response.data.data.url) {
    return response.data.data.display_url || response.data.data.url;
  }

  throw new Error("Invalid response format from ImgBB API.");
}
