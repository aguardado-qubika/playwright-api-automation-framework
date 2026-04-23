export const ENDPOINTS = {
  PRODUCTS: '/products',
} as const;

export const STATUS = {
  OK:           200,
  CREATED:      201,
  NO_CONTENT:   204,
  BAD_REQUEST:  400,
  NOT_FOUND:    404,
  SERVER_ERROR: 500,
} as const;
