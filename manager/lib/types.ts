import { IBoard, IList, ICard, IUser } from './models';

// Frontend-friendly types (without mongoose Document)
export type Board = Omit<IBoard, keyof Document> & {
  _id: string;
};

export type List = Omit<IList, keyof Document> & {
  _id: string;
  cards?: Card[];
};

export type Card = Omit<ICard, keyof Document> & {
  _id: string;
  assignedTo?: (Omit<IUser, keyof Document> & { _id: string })[];
};

export type User = Omit<IUser, keyof Document> & {
  _id: string;
};

export type Priority = 'low' | 'medium' | 'high' | 'urgent';