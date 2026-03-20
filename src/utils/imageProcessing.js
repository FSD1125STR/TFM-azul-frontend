/**
 * Wraps Image loading from a Blob in a Promise.
 * @param {Blob} blob
 * @returns {Promise<HTMLImageElement>}
 */
export const loadImageFromBlob = (blob) =>
    new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = (e) => {
            URL.revokeObjectURL(url);
            reject(e);
        };
        img.src = url;
    });

/**
 * Wraps canvas.toBlob in a Promise.
 * @param {HTMLCanvasElement} canvas
 * @param {string} type - MIME type (e.g. "image/webp")
 * @param {number} quality - 0–1
 * @returns {Promise<Blob|null>}
 */
export const canvasToBlob = (canvas, type, quality) =>
    new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), type, quality);
    });

/**
 * Resizes an image file and converts it to WebP (falls back to JPEG).
 * @param {File|Blob} file
 * @param {{ maxSize?: number, quality?: number }} options
 * @returns {Promise<Blob>}
 */
export const fileToOptimizedBlob = async (file, { maxSize = 512, quality = 0.85 } = {}) => {
    const img = await loadImageFromBlob(file);
    const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
    const width = Math.max(1, Math.round(img.width * ratio));
    const height = Math.max(1, Math.round(img.height * ratio));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(img, 0, 0, width, height);

    const webp = await canvasToBlob(canvas, "image/webp", quality);
    if (webp && webp.size > 0) return webp;

    const jpeg = await canvasToBlob(canvas, "image/jpeg", quality);
    if (jpeg && jpeg.size > 0) return jpeg;

    return file;
};

/**
 * Uploads a file to Cloudinary using signed upload parameters.
 * @param {Blob} file
 * @param {{ cloudName: string, apiKey: string, timestamp: number, signature: string, folder?: string, allowed_formats?: string, type?: string }} signatureData
 * @returns {Promise<string>} secure_url of the uploaded image
 */
export const uploadToCloudinary = async (file, signatureData) => {
    const cloudName = signatureData?.cloudName;
    const apiKey = signatureData?.apiKey;
    const timestamp = signatureData?.timestamp;
    const signature = signatureData?.signature;
    const folder = signatureData?.folder;
    const allowed_formats = signatureData?.allowed_formats;
    const type = signatureData?.type;

    if (!cloudName || !apiKey || !timestamp || !signature) {
        throw new Error("Faltan datos para subir la imagen");
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);
    if (folder) form.append("folder", folder);
    if (allowed_formats) form.append("allowed_formats", allowed_formats);
    if (type) form.append("type", type);

    const response = await fetch(endpoint, { method: "POST", body: form });
    if (!response.ok) {
        throw new Error("No se pudo subir la imagen a Cloudinary");
    }

    const data = await response.json();
    return data?.secure_url ?? data?.url ?? "";
};
