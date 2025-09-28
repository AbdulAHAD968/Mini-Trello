import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  password: string;
  createdAt: Date;
}

export interface IBoard extends Document {
  title: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IList extends Document {
  title: string;
  boardId: mongoose.Types.ObjectId;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICard extends Document {
  title: string;
  description: string;
  listId: mongoose.Types.ObjectId;
  position: number;
  assignedTo: mongoose.Types.ObjectId[];
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const BoardSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ListSchema = new Schema({
  title: { type: String, required: true },
  boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
  position: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CardSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  listId: { type: Schema.Types.ObjectId, ref: 'List', required: true },
  position: { type: Number, required: true },
  assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  dueDate: { type: Date },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [{ type: String }], // Add this line
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Board = mongoose.models.Board || mongoose.model<IBoard>('Board', BoardSchema);
export const List = mongoose.models.List || mongoose.model<IList>('List', ListSchema);
export const Card = mongoose.models.Card || mongoose.model<ICard>('Card', CardSchema);