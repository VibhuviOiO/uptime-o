import { IRegion } from 'app/shared/model/region.model';

export interface IDatacenter {
  id?: number;
  code?: string;
  name?: string;
  region?: IRegion | null;
}

export const defaultValue: Readonly<IDatacenter> = {};
