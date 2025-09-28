import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { List, Board } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const { lists } = await request.json();

    if (!lists || !Array.isArray(lists)) {
      return NextResponse.json(
        { error: 'Lists array is required' },
        { status: 400 }
      );
    }

    // Verify user has access to all lists and update positions
    const updatePromises = lists.map(async (list) => {
      // Check if user has access to the board
      const board = await Board.findOne({
        _id: list.boardId,
        $or: [
          { owner: payload.userId },
          { members: payload.userId }
        ]
      });

      if (!board) {
        throw new Error(`Access denied to board ${list.boardId}`);
      }

      // Update list position
      return List.findByIdAndUpdate(
        list._id,
        { 
          position: list.position, 
          updatedAt: new Date() 
        },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ message: 'Lists reordered successfully' });
  } catch (error) {
    console.error('Reorder lists error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}