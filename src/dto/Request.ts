import { IService } from "./Service";

export interface IRequest {
  chatId: number;
  serviceType: IService["key"];
  date: number;
  isApproved: boolean;
  username: string | undefined;
  userFullName: string;
  userCustomData?: string;
}

export interface IUpdatedRequest extends IRequest {
  updatedDate: number;
}
