import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Card, List, Board } from '@/lib/models';
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
    const card = await Card.findById(params.id).populate('assignedTo', 'name email');

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Check if user has access to the card's board
    const list = await List.findById(card.listId);
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

    return NextResponse.json(card);
  } catch (error) {
    console.error('Get card error:', error);
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
    const { 
      title, 
      description, 
      listId, 
      position, 
      assignedTo, 
      dueDate, 
      priority,
      tags 
    } = await request.json();

    // Validate priority if provided
    if (priority && !['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return NextResponse.json(
        { error: 'Priority must be one of: low, medium, high, urgent' },
        { status: 400 }
      );
    }

    const card = await Card.findById(params.id);
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Check if user has access to the current list
    const currentList = await List.findById(card.listId);
    if (!currentList) {
      return NextResponse.json({ error: 'Current list not found' }, { status: 404 });
    }

    const currentBoard = await Board.findOne({
      _id: currentList.boardId,
      $or: [
        { owner: payload.userId },
        { members: payload.userId }
      ]
    });

    if (!currentBoard) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // If moving to a different list, check access to destination list
    if (listId && listId !== card.listId) {
      const destinationList = await List.findById(listId);
      if (!destinationList) {
        return NextResponse.json({ error: 'Destination list not found' }, { status: 404 });
      }

      const destinationBoard = await Board.findOne({
        _id: destinationList.boardId,
        $or: [
          { owner: payload.userId },
          { members: payload.userId }
        ]
      });

      if (!destinationBoard) {
        return NextResponse.json({ error: 'Access denied to destination list' }, { status: 403 });
      }

      // If moving lists, we need to update positions in both lists
      if (position !== undefined) {
        // Increment positions of cards in destination list that are >= the new position
        await Card.updateMany(
          {
            listId: listId,
            _id: { $ne: params.id },
            position: { $gte: position }
          },
          { $inc: { position: 1 } }
        );

        // Decrement positions of cards in the original list that were after the moved card
        await Card.updateMany(
          {
            listId: card.listId,
            position: { $gt: card.position }
          },
          { $inc: { position: -1 } }
        );
      }
    } else if (position !== undefined && position !== card.position) {
      // Moving within the same list
      if (position > card.position) {
        // Moving down - decrement positions of cards between old and new position
        await Card.updateMany(
          {
            listId: card.listId,
            _id: { $ne: params.id },
            position: { $gt: card.position, $lte: position }
          },
          { $inc: { position: -1 } }
        );
      } else {
        // Moving up - increment positions of cards between new and old position
        await Card.updateMany(
          {
            listId: card.listId,
            _id: { $ne: params.id },
            position: { $gte: position, $lt: card.position }
          },
          { $inc: { position: 1 } }
        );
      }
    }

    // Update card fields
    const updateFields: any = {};
    
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (listId !== undefined) updateFields.listId = listId;
    if (position !== undefined) updateFields.position = position;
    if (assignedTo !== undefined) updateFields.assignedTo = assignedTo;
    if (dueDate !== undefined) updateFields.dueDate = dueDate ? new Date(dueDate) : null;
    if (priority !== undefined) updateFields.priority = priority;
    if (tags !== undefined) updateFields.tags = tags;
    
    updateFields.updatedAt = new Date();

    const updatedCard = await Card.findByIdAndUpdate(
      params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    if (!updatedCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error('Update card error:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }
    
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

    const card = await Card.findById(params.id);
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Check if user has access to the card's board
    const list = await List.findById(card.listId);
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

    // Update positions of remaining cards in the list
    await Card.updateMany(
      {
        listId: card.listId,
        position: { $gt: card.position }
      },
      { $inc: { position: -1 } }
    );

    await Card.findByIdAndDelete(params.id);

    return NextResponse.json({ 
      message: 'Card deleted successfully',
      deletedCardId: params.id
    });
  } catch (error) {
    console.error('Delete card error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}