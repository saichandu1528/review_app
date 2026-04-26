import nodemailer from 'nodemailer';

// Email configuration
// In production, these should be set in your .env file
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = Number(process.env.EMAIL_PORT) || 465;
const EMAIL_USER = (process.env.EMAIL_USER || 'saichandu1528@gmail.com').trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || 'embl ndtt bate ccdk').replace(/\s/g, ''); // Remove all spaces
const EMAIL_FROM = process.env.EMAIL_FROM || `"Review Platform" <${EMAIL_USER}>`;

console.log('Mail Config:', { host: EMAIL_HOST, port: EMAIL_PORT, user: EMAIL_USER });

// Create transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // true for 465, false for other ports
  auth: EMAIL_USER && EMAIL_PASS ? {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  } : undefined,
});

/**
 * Sends a welcome email to a new user with their credentials
 */
export const sendWelcomeEmail = async (to: string, name: string, password: string, role: string) => {
  const roleName = role === 'STORE_OWNER' ? 'Store Owner' : role === 'ADMIN' ? 'System Administrator' : 'Normal User';
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
      <h2 style="color: #4f46e5; margin-bottom: 24px;">Welcome to Review Platform!</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>An account has been created for you as a <strong>${roleName}</strong> in review website.</p>
      
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <h3 style="margin-top: 0; font-size: 16px; color: #050404fe;">Your Login Credentials:</h3>
        <p style="margin-bottom: 8px;"><strong>Email:</strong> ${to}</p>
        <p style="margin-bottom: 0;"><strong>Temporary Password:</strong> <code style="background: #08090ac9; padding: 2px 4px; border-radius: 4px;">${password}</code></p>
      </div>
      
      <p style="color: #d83a3aff; font-weight: bold;">Important:</p>
      <p>For security reasons, please log in and change your password immediately.</p>
      
      <div style="margin-top: 32px; text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
           style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Login to Your Account
        </a>
      </div>
      
      <p style="margin-top: 32px; font-size: 12px; color: #64748b;">
        If you did not expect this email, please contact our support team.
      </p>
    </div>
  `;

  try {
    // If no credentials are provided, try to create a test account automatically using ethereal.email
    if (!EMAIL_USER || !EMAIL_PASS) {
      console.log('No email credentials found. Creating ethereal test account...');
      const testAccount = await nodemailer.createTestAccount();
      const testTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      
      const info = await testTransporter.sendMail({
        from: '"Review Platform" <noreply@reviewplatform.com>',
        to,
        subject: 'Welcome to Review Platform - Your Account Credentials',
        html,
      });
      
      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      return info;
    }

    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject: 'Welcome to Review Platform - Your Account Credentials',
      html,
    });
    
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};
