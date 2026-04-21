/**
 * ENDPOINTS — resource path segments for every JSONPlaceholder collection.
 * Controllers use these as their basePath to eliminate string duplication.
 */
export const ENDPOINTS = {
  POSTS:    '/posts',
  USERS:    '/users',
  TODOS:    '/todos',
  COMMENTS: '/comments',
  ALBUMS:   '/albums',
  PHOTOS:   '/photos',
} as const;

/**
 * STATUS — HTTP status codes referenced in contract tests.
 * Centralised so a single rename propagates to every assertion.
 */
export const STATUS = {
  OK:         200,
  CREATED:    201,
  NO_CONTENT: 204,
  BAD_REQUEST:400,
  NOT_FOUND:  404,
  SERVER_ERROR: 500,
} as const;
