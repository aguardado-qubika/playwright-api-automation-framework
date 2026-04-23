import { type Product } from '@models/product.model';

export function isProduct(value: unknown): value is Product {
  const v = value as Product;
  return (
    typeof v === 'object' && v !== null &&
    typeof v.id    === 'number' &&
    typeof v.name  === 'string' &&
    typeof v.price === 'number'
  );
}
