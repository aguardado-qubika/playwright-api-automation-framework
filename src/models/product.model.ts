export interface Product {
  id:    number;
  name:  string;
  price: number;
}

export type CreateProductPayload = Omit<Product, 'id'>;
export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface CreateProductResponse extends Omit<Product, 'id'> {
  id:     string;
  status: string;
}

export interface PutProductResponse {
  id:      string;
  message: string;
}
