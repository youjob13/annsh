export enum ServiceOption {
  Min = "min",
  Medium = "medium",
  Normal = "normal",
  Max = "max",
}

export type IService = {
  key: ServiceOption;
  name: string;
};
