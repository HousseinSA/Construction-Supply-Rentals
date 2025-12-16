import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/mongodb';
import { sendPasswordResetEmail } from '@/src/lib/email';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, locale } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If email exists, reset link sent',
      });
    }

    const resetToken = jwt.sign(
      { email, userId: user._id.toString() },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '1h' }
    );

    await sendPasswordResetEmail(email, resetToken, locale || 'en');

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send reset email' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Token and password required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { email: string; userId: string };
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    await db.collection('users').updateOne(
      { email: decoded.email },
      { $set: { password: newPassword, updatedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
