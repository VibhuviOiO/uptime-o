import { IDatacenter } from 'app/shared/model/datacenter.model';

export interface IAgent {
  id?: number;
  name?: string;
  datacenter?: IDatacenter | null;
}

export const defaultValue: Readonly<IAgent> = {};
