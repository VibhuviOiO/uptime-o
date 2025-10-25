export interface ISchedule {
  id?: number;
  name?: string;
  interval?: number;
  includeResponseBody?: boolean | null;
  thresholdsWarning?: number | null;
  thresholdsCritical?: number | null;
}

export const defaultValue: Readonly<ISchedule> = {
  includeResponseBody: false,
};
