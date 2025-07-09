export interface IPagingCollectionData {
  pageNumber: number;
  pageSize: number;
  pageCount: number;
  itemCount: number;
}

export interface ICollection<Entity extends object>
  extends Partial<IPagingCollectionData> {
  data: Entity[];
}
