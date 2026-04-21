export interface Post {
  id:     number;
  userId: number;
  title:  string;
  body:   string;
}

export type CreatePostPayload = Omit<Post, 'id'>;
export type UpdatePostPayload = Partial<CreatePostPayload>;