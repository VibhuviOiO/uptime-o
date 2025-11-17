import axios from 'axios';
import { IBranding } from 'app/shared/model/website-settings.model';

const apiUrl = 'api/brandings';

export const getBrandings = async () => {
  try {
    const response = await axios.get<IBranding[]>(apiUrl);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error('Branding module not enabled');
    }
    throw error;
  }
};

export const getBranding = async (id: number) => {
  try {
    const response = await axios.get<IBranding>(`${apiUrl}/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error('Branding module not enabled');
    }
    throw error;
  }
};

export const getActiveBranding = async () => {
  try {
    const response = await axios.get<IBranding>(`${apiUrl}/active`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error('Branding module not enabled');
    }
    throw error;
  }
};

export const getActiveBrandingPublic = async () => {
  try {
    const response = await axios.get<IBranding>('api/public/brandings/active');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const createBranding = async (branding: IBranding) => {
  try {
    const response = await axios.post<IBranding>(apiUrl, branding);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error('Branding module not enabled');
    }
    throw error;
  }
};

export const updateBranding = async (branding: IBranding) => {
  try {
    const response = await axios.put<IBranding>(`${apiUrl}/${branding.id}`, branding);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error('Branding module not enabled');
    }
    throw error;
  }
};

export const deleteBranding = async (id: number) => {
  try {
    await axios.delete(`${apiUrl}/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error('Branding module not enabled');
    }
    throw error;
  }
};
