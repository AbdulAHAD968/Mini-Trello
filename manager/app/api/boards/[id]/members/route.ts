import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Board, User } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await dbConnect();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const { userId, email } = await request.json();

    // Check if board exists and user is owner
    const board = await Board.findOne({
      _id: id,
      owner: payload.userId,
    });

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found or access denied' },
        { status: 404 }
      );
    }

    // Find user to add
    const userToAdd = await User.findOne({
      $or: [{ _id: userId }, { email }],
    });

    if (!userToAdd) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is already a member
    if (board.members.includes(userToAdd._id)) {
      return NextResponse.json(
        { error: 'User is already a member' },
        { status: 400 }
      );
    }

    // Add user to members
    board.members.push(userToAdd._id);
    await board.save();

    // Populate and return updated board
    await board.populate('owner', 'name email');
    await board.populate('members', 'name email');

    return NextResponse.json(board);
  } catch (error) {
    console.error('Add member error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; 
    await dbConnect();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const { userId } = await request.json();

    // Check if board exists and user is owner
    const board = await Board.findOne({
      _id: id,
      owner: payload.userId,
    });

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found or access denied' },
        { status: 404 }
      );
    }

    // Cannot remove owner
    if (userId === payload.userId.toString()) {
      return NextResponse.json(
        { error: 'Cannot remove board owner' },
        { status: 400 }
      );
    }

    // Remove user from members
    board.members = board.members.filter(
      (memberId: any) => memberId.toString() !== userId
    );
    await board.save();

    // Populate and return updated board
    await board.populate('owner', 'name email');
    await board.populate('members', 'name email');

    return NextResponse.json(board);
  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
