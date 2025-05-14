export interface IAppErrorResponse {
  error: IAppError;
}

export interface IBaseErrorInfo {
  status?: number;
  pointer?: string;
  title?: string;
  message?: string;
}

interface IAppError {
  status: string;
  source: { pointer: string };
  title: string;
  detail: string;
}
