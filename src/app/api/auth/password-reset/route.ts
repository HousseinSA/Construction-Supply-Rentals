import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/mongodb';
import { sendPasswordResetEmail } from '@/src/lib/email';
import crypto from 'crypto';

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

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); 

    await db.collection('password_resets').insertOne({
      email,
      token: resetToken,
      expiresAt: resetTokenExpiry,
      createdAt: new Date(),
    });

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

    const db = await connectDB();
    const resetRequest = await db.collection('password_resets').findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRequest) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    await db.collection('users').updateOne(
      { email: resetRequest.email },
      { $set: { password: newPassword, updatedAt: new Date() } }
    );

    await db.collection('password_resets').deleteOne({ token });

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
