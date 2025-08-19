export type Stock = {
  id?: number;
  quantity?: number;
  productId?: number;
  type?: Stocktype;
  createdAt?: string;
};

export enum Stocktype {
  In = "in",
  Out = "out",
}
