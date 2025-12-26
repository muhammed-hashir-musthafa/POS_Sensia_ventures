export interface CommentAttributes {
  id: number;
  orderId: number;
  userId: number;
  text: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CommentCreationAttributes extends Omit<CommentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export interface CommentResponse {
  id: number;
  orderId: number;
  userId: number;
  text: string;
  createdAt?: Date;
}

export interface CreateCommentPayload {
  orderId: number;
  text: string;
}

export interface UpdateCommentPayload {
  text: string;
}
