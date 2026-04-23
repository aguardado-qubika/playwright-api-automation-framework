import { type Post }    from '@models/post.model';
import { type User }    from '@models/user.model';
import { type Todo }    from '@models/todo.model';
import { type Product } from '@models/product.model';

// ── Type guards ────────────────────────────────────────────────────────────
// Use these in specs to assert response bodies conform to the TypeScript model.
// Example:
//   const body = await response.json();
//   expect(isPost(body)).toBe(true);

export function isPost(value: unknown): value is Post {
  const v = value as Post;
  return (
    typeof v === 'object' && v !== null &&
    typeof v.id     === 'number' &&
    typeof v.userId === 'number' &&
    typeof v.title  === 'string' &&
    typeof v.body   === 'string'
  );
}

export function isPostArray(value: unknown): value is Post[] {
  return Array.isArray(value) && value.every(isPost);
}

export function isUser(value: unknown): value is User {
  const v = value as User;
  return (
    typeof v === 'object' && v !== null &&
    typeof v.id       === 'number' &&
    typeof v.name     === 'string' &&
    typeof v.username === 'string' &&
    typeof v.email    === 'string' &&
    typeof v.phone    === 'string' &&
    typeof v.website  === 'string' &&
    typeof v.address  === 'object' && v.address !== null &&
    typeof v.company  === 'object' && v.company !== null
  );
}

export function isUserArray(value: unknown): value is User[] {
  return Array.isArray(value) && value.every(isUser);
}

export function isTodo(value: unknown): value is Todo {
  const v = value as Todo;
  return (
    typeof v === 'object' && v !== null &&
    typeof v.id        === 'number' &&
    typeof v.userId    === 'number' &&
    typeof v.title     === 'string' &&
    typeof v.completed === 'boolean'
  );
}

export function isTodoArray(value: unknown): value is Todo[] {
  return Array.isArray(value) && value.every(isTodo);
}

export function isProduct(value: unknown): value is Product {
  const v = value as Product;
  return (
    typeof v === 'object' && v !== null &&
    typeof v.id    === 'number' &&
    typeof v.name  === 'string' &&
    typeof v.price === 'number'
  );
}
