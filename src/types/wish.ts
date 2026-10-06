export const MAX_NAME_LENGTH = 80;
export const MAX_WISH_LENGTH = 500;

export interface WishRecord {
  id: string;
  name: string;
  wish: string;
  flagged: boolean;
  createdAt: string;
}

export interface WishesPage {
  wishes: WishRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
