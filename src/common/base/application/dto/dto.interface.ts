// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IDto {}

export interface IResponseDto extends IDto {
  id?: string;
  type: string;
}
