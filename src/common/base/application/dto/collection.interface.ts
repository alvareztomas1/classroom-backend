export interface IPagingCollectionData {
  pageNumber: number;
  pageSize: number;
  pageCount: number;
  itemCount: number;
}

export interface ICollection<Entity extends object> {
  data: Entity[];
  meta?: IPagingCollectionData;
}
