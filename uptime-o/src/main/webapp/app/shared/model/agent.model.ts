import { IRegion } from 'app/shared/model/region.model';

export interface IAgent {
  id?: number;
  name?: string;
  region?: IRegion | null;
}

export const defaultValue: Readonly<IAgent> = {};
