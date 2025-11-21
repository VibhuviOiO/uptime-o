export enum DependencyType {
  SERVICE = 'SERVICE',
  HTTP = 'HTTP',
  INSTANCE = 'INSTANCE',
}

export interface IStatusDependency {
  id?: number;
  parentType?: DependencyType;
  parentId?: number;
  childType?: DependencyType;
  childId?: number;
  metadata?: any;
  statusPageId?: number;
  createdAt?: string;
}

export const defaultValue: Readonly<IStatusDependency> = {};
