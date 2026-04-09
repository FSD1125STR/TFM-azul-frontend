import axios from "axios";

/**
 * Uploads a file to Cloudinary using a backend-generated signature.
 * @param {Object} options
 * @param {File} options.file - The file to upload
 * @param {string} options.signatureEndpoint - Full URL to the backend signature endpoint
 * @returns {Promise<{ secureUrl: string, publicId: string }>}
 */

//Sube archivo a cloudinary, indicando el endpoit para obtener la firma
export const uploadToCloudinary = async ({ file, signatureEndpoint }) => {
    // 1. Obtenemos la firma del backend, utilizando el endpoint correspondiente
    const { data: sig } = await axios.post(signatureEndpoint, {}, { withCredentials: true });

    const resourceType = sig.resource_type;
    const cloudName = sig.cloudName;

    // 2. Construimos el FormData para enviar un archivo
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sig.apiKey);
    formData.append("timestamp", sig.timestamp);
    formData.append("signature", sig.signature);
    formData.append("type", sig.type);

    if (sig.folder) formData.append("folder", sig.folder); //Carpeta donde se guardará en Cloudinary
    if (sig.public_id) formData.append("public_id", sig.public_id);
    if (sig.allowed_formats) formData.append("allowed_formats", sig.allowed_formats);

    // 3. Subimos el archivo a Cloudinary usando su API
    const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        { method: "POST", body: formData }
    );

    if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? "Error al subir archivo a Cloudinary");
    }

    const data = await uploadRes.json();
    //Devolvemos el id y la url
    return { secureUrl: data.secure_url, publicId: data.public_id };
};
