export interface IRegion {
  id?: number;
  name?: string;
  regionCode?: string | null;
  groupName?: string | null;
}

export const defaultValue: Readonly<IRegion> = {};
