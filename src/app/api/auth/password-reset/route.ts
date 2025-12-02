import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/mongodb';
import { sendPasswordResetEmail } from '@/src/lib/email';
import crypto from 'crypto';

// POST /api/auth/password-reset - Request password reset
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

    // Always return success (security: don't reveal if email exists)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If email exists, reset link sent',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save token to database
    await db.collection('password_resets').insertOne({
      email,
      token: resetToken,
      expiresAt: resetTokenExpiry,
      createdAt: new Date(),
    });

    // Send email
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

// PUT /api/auth/password-reset - Reset password with token
export async function PUT(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Token and password required' },
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

    // Update password
    await db.collection('users').updateOne(
      { email: resetRequest.email },
      { $set: { password: newPassword, updatedAt: new Date() } }
    );

    // Delete used token
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
