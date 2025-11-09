import axios from 'axios';
import { IWebsiteSettings } from 'app/shared/model/website-settings.model';

const apiUrl = 'api/website-settings';

export const getWebsiteSettings = async (): Promise<IWebsiteSettings> => {
  const response = await axios.get<IWebsiteSettings>(apiUrl);
  return response.data;
};
