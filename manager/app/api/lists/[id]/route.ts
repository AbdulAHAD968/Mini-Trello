import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { List, Board } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const list = await List.findById(params.id);

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    // Check if user has access to the board
    const board = await Board.findOne({
      _id: list.boardId,
      $or: [
        { owner: payload.userId },
        { members: payload.userId }
      ]
    });

    if (!board) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error('Get list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const { title, position } = await request.json();

    const list = await List.findById(params.id);
    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    // Check if user has access to the board
    const board = await Board.findOne({
      _id: list.boardId,
      $or: [
        { owner: payload.userId },
        { members: payload.userId }
      ]
    });

    if (!board) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update list fields
    if (title !== undefined) list.title = title;
    if (position !== undefined) list.position = position;
    list.updatedAt = new Date();

    await list.save();

    return NextResponse.json(list);
  } catch (error) {
    console.error('Update list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);

    const list = await List.findById(params.id);
    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    // Check if user has access to the board
    const board = await Board.findOne({
      _id: list.boardId,
      $or: [
        { owner: payload.userId },
        { members: payload.userId }
      ]
    });

    if (!board) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await List.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Delete list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}