import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { List, Board } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId');

    if (!boardId) {
      return NextResponse.json(
        { error: 'boardId is required' },
        { status: 400 }
      );
    }

    // Check if user has access to the board
    const board = await Board.findOne({
      _id: boardId,
      $or: [
        { owner: payload.userId },
        { members: payload.userId }
      ]
    });

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    const lists = await List.find({ boardId }).sort({ position: 1 });

    return NextResponse.json(lists);
  } catch (error) {
    console.error('Get lists error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const { title, boardId } = await request.json();

    if (!title || !boardId) {
      return NextResponse.json(
        { error: 'Title and boardId are required' },
        { status: 400 }
      );
    }

    // Check if user has access to the board
    const board = await Board.findOne({
      _id: boardId,
      $or: [
        { owner: payload.userId },
        { members: payload.userId }
      ]
    });

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    // Get the highest position to add the new list at the end
    const lastList = await List.findOne({ boardId }).sort({ position: -1 });
    const position = lastList ? lastList.position + 1 : 0;

    const list = await List.create({
      title,
      boardId,
      position,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    console.error('Create list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}