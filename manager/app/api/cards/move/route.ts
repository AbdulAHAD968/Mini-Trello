import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Card, List, Board } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const { cardId, sourceListId, destinationListId, destinationIndex } = await request.json();

    if (!cardId || !sourceListId || !destinationListId || destinationIndex === undefined) {
      return NextResponse.json(
        { error: 'cardId, sourceListId, destinationListId, and destinationIndex are required' },
        { status: 400 }
      );
    }

    // Get the card and verify access
    const card = await Card.findById(cardId);
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Verify user has access to both source and destination boards
    const [sourceBoard, destinationBoard] = await Promise.all([
      Board.findOne({
        _id: sourceListId,
        $or: [
          { owner: payload.userId },
          { members: payload.userId }
        ]
      }),
      Board.findOne({
        _id: destinationListId,
        $or: [
          { owner: payload.userId },
          { members: payload.userId }
        ]
      })
    ]);

    if (!sourceBoard || !destinationBoard) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update card position and list
    await Card.findByIdAndUpdate(cardId, {
      listId: destinationListId,
      position: destinationIndex,
      updatedAt: new Date()
    });

    // Reorder other cards in the destination list
    await Card.updateMany(
      {
        listId: destinationListId,
        _id: { $ne: cardId },
        position: { $gte: destinationIndex }
      },
      { $inc: { position: 1 } }
    );

    // Reorder cards in the source list
    await Card.updateMany(
      {
        listId: sourceListId,
        position: { $gt: card.position }
      },
      { $inc: { position: -1 } }
    );

    return NextResponse.json({ message: 'Card moved successfully' });
  } catch (error) {
    console.error('Move card error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}