export enum DependencyType {
  SERVICE = 'SERVICE',
  HTTP = 'HTTP',
  INSTANCE = 'INSTANCE',
}

export interface IStatusDependency {
  id?: number;
  parentType?: keyof typeof DependencyType;
  parentId?: number;
  childType?: keyof typeof DependencyType;
  childId?: number;
  metadata?: any | null;
  statusPageId?: number | null;
  createdAt?: string | null;
}

export const defaultValue: Readonly<IStatusDependency> = {};
