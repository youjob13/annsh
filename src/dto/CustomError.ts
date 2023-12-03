import { AxiosError } from "axios";

export interface CustomError extends AxiosError<any> {
  id: string;
}
