import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Card, List, Board } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const { title, description, listId, priority, dueDate, tags } = await request.json();

    if (!title || !listId) {
      return NextResponse.json(
        { error: 'Title and listId are required' },
        { status: 400 }
      );
    }

    // Check if user has access to the list
    const list = await List.findById(listId);
    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

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

    // Get the highest position to add the new card at the end
    const lastCard = await Card.findOne({ listId }).sort({ position: -1 });
    const position = lastCard ? lastCard.position + 1 : 0;

    const card = await Card.create({
      title,
      description,
      listId,
      position,
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await card.populate('assignedTo', 'name email');

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error('Create card error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('listId');

    if (!listId) {
      return NextResponse.json(
        { error: 'listId is required' },
        { status: 400 }
      );
    }

    // Check if user has access to the list
    const list = await List.findById(listId);
    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

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

    const cards = await Card.find({ listId })
      .populate('assignedTo', 'name email')
      .sort({ position: 1 });

    return NextResponse.json(cards);
  } catch (error) {
    console.error('Get cards error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}