import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  locale: string = 'en'
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/${locale}/auth/reset-password/confirm?token=${resetToken}`;

  const translations = {
    ar: {
      subject: 'إعادة تعيين كلمة المرور - Kriliy Engin',
      title: 'إعادة تعيين كلمة المرور',
      message: 'لقد تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بك.',
      button: 'إعادة تعيين كلمة المرور',
      expire: 'هذا الرابط صالح لمدة ساعة واحدة.',
      ignore: 'إذا لم تطلب ذلك، يرجى تجاهل هذا البريد الإلكتروني.',
    },
    fr: {
      subject: 'Réinitialisation du mot de passe - Kriliy Engin',
      title: 'Réinitialisation du mot de passe',
      message: 'Nous avons reçu une demande de réinitialisation de votre mot de passe.',
      button: 'Réinitialiser le mot de passe',
      expire: 'Ce lien est valable pendant 1 heure.',
      ignore: 'Si vous n\'avez pas demandé cela, veuillez ignorer cet e-mail.',
    },
    en: {
      subject: 'Password Reset - Kriliy Engin',
      title: 'Reset Your Password',
      message: 'We received a request to reset your password.',
      button: 'Reset Password',
      expire: 'This link is valid for 1 hour.',
      ignore: 'If you didn\'t request this, please ignore this email.',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

  await transporter.sendMail({
    from: `"Kriliy-car" <${process.env.EMAIL_USER}>`,
    to,
    subject: t.subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">${t.title}</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">${t.message}</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">${t.button}</a>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">${t.expire}</p>
            <p style="font-size: 14px; color: #666;">${t.ignore}</p>
          </div>
        </body>
      </html>
    `,
  });
}
