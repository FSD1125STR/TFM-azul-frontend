import axios from "axios";
import { uploadToCloudinary, API_BASE_URL } from "./cloudinaryUpload.js";

const normalizeError = (error, fallbackMessage) => {
  const status = error.response?.status ?? 0;
  const message = error.response?.data?.message || fallbackMessage;
  const normalized = new Error(message);
  normalized.status = status;
  normalized.originalError = error;
  return normalized;
};

export const getCrewFiles = async (crewId) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/api/crews/${crewId}/files`, {
      withCredentials: true,
    });
    return data.files;
  } catch (error) {
    throw normalizeError(error, "No se pudieron cargar los archivos");
  }
};

export const uploadCrewFile = async (crewId, file) => {
  try {
    const { secureUrl, publicId } = await uploadToCloudinary({
      file,
      signatureEndpoint: `${API_BASE_URL}/api/crews/${crewId}/upload-file-signature`,
    });

    const { data } = await axios.post(
      `${API_BASE_URL}/api/crews/${crewId}/files`,
      {
        originalName: file.name,
        url: secureUrl,
        publicId,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
      },
      { withCredentials: true }
    );

    return data.file;
  } catch (error) {
    throw normalizeError(error, "No se pudo subir el archivo");
  }
};

export const deleteCrewFile = async (crewId, fileId) => {
  try {
    const { data } = await axios.delete(
      `${API_BASE_URL}/api/crews/${crewId}/files/${fileId}`,
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    throw normalizeError(error, "No se pudo eliminar el archivo");
  }
};
