import axios from 'axios';

export interface FileUploadResponse {
  fileName: string;
  filePath: string;
  url: string;
}

export const uploadFile = async (type: 'logo' | 'favicon', file: File): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post<FileUploadResponse>(`/api/files/upload/${type}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
