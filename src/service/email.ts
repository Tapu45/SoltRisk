import nodemailer from 'nodemailer'

// Configure Gmail transporter
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export const sendResetPasswordEmail = async (email: string, resetCode: string) => {
  await transporter.sendMail({
    from: process.env.GMAIL_USER || 'your-email@gmail.com',
    to: email,
    subject: 'Password Reset Code',
    text: `Your password reset code is: ${resetCode}. This code will expire in 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Your password reset code is:</p>
        <h1 style="font-size: 32px; background-color: #f5f5f5; padding: 10px; text-align: center;">${resetCode}</h1>
        <p>This code will expire in 15 minutes.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  })
}