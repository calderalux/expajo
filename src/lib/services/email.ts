import nodemailer from 'nodemailer';
import { OtpPurpose } from '@/types/auth';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface OtpEmailData {
  to: string;
  code: string;
  purpose: OtpPurpose;
  expiresIn: number; // minutes
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      const config: EmailConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      };

      if (config.auth.user && config.auth.pass) {
        this.transporter = nodemailer.createTransport(config);
        this.isConfigured = true;
        console.log('Email service configured successfully');
      } else {
        console.warn('Email service not configured - missing SMTP credentials');
      }
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  /**
   * Send OTP code via email
   */
  async sendOtp(data: OtpEmailData): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isConfigured || !this.transporter) {
        // Fallback to console logging for development
        console.log(`📧 OTP Email (Development Mode)`);
        console.log(`To: ${data.to}`);
        console.log(`Code: ${data.code}`);
        console.log(`Purpose: ${data.purpose}`);
        console.log(`Expires in: ${data.expiresIn} minutes`);
        console.log('---');
        
        return { success: true };
      }

      const template = this.generateOtpTemplate(data);
      
      const mailOptions = {
        from: `"Expajo Admin" <${process.env.SMTP_USER}>`,
        to: data.to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`OTP email sent successfully to ${data.to}:`, result.messageId);
      return { success: true };
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Generate OTP email template
   */
  private generateOtpTemplate(data: OtpEmailData): EmailTemplate {
    const { code, purpose, expiresIn } = data;
    
    const purposeText = this.getPurposeText(purpose);
    const expiryTime = new Date(Date.now() + expiresIn * 60 * 1000).toLocaleTimeString();
    
    const subject = `Your Expajo Admin ${purposeText} Code`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Access Code</title>
        <style>
          body {
            font-family: 'Lato', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-family: 'Playfair Display', serif;
            font-size: 32px;
            font-weight: bold;
            color: #4362FF;
            margin-bottom: 10px;
          }
          .otp-code {
            background: linear-gradient(135deg, #4362FF 0%, #7530FF 100%);
            color: white;
            font-size: 36px;
            font-weight: bold;
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            letter-spacing: 8px;
            margin: 30px 0;
            font-family: 'Courier New', monospace;
          }
          .info-box {
            background: #f8f9fa;
            border-left: 4px solid #039855;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #4362FF 0%, #7530FF 100%);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 40px;
            font-weight: bold;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Expajo</div>
            <h1 style="color: #333; margin: 0;">Admin Access Code</h1>
          </div>
          
          <p>Hello,</p>
          <p>You have requested a ${purposeText.toLowerCase()} code for your Expajo admin account.</p>
          
          <div class="otp-code">${code}</div>
          
          <div class="info-box">
            <h3 style="margin-top: 0; color: #039855;">Important Information:</h3>
            <ul>
              <li><strong>Code expires:</strong> ${expiryTime} (${expiresIn} minutes from now)</li>
              <li><strong>Maximum attempts:</strong> 3 tries</li>
              <li><strong>Security:</strong> Never share this code with anyone</li>
            </ul>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> If you didn't request this code, please ignore this email and contact our support team immediately.
          </div>
          
          <p>Enter this code in the admin login form to complete your authentication.</p>
          
          <div class="footer">
            <p>This email was sent by Expajo Admin System</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const text = `
Expajo Admin Access Code

Hello,

You have requested a ${purposeText.toLowerCase()} code for your Expajo admin account.

Your access code is: ${code}

Important Information:
- Code expires: ${expiryTime} (${expiresIn} minutes from now)
- Maximum attempts: 3 tries
- Security: Never share this code with anyone

Enter this code in the admin login form to complete your authentication.

If you didn't request this code, please ignore this email and contact our support team immediately.

This email was sent by Expajo Admin System
    `.trim();
    
    return { subject, html, text };
  }

  /**
   * Get human-readable purpose text
   */
  private getPurposeText(purpose: OtpPurpose): string {
    switch (purpose) {
      case OtpPurpose.ADMIN_LOGIN:
        return 'Login';
      case OtpPurpose.PASSWORD_RESET:
        return 'Password Reset';
      case OtpPurpose.EMAIL_VERIFICATION:
        return 'Email Verification';
      case OtpPurpose.TWO_FACTOR:
        return 'Two-Factor Authentication';
      default:
        return 'Access';
    }
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.transporter) {
        return { success: false, error: 'Email service not configured' };
      }

      await this.transporter.verify();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  }

  /**
   * Send test email
   */
  async sendTestEmail(to: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.transporter) {
        return { success: false, error: 'Email service not configured' };
      }

      const mailOptions = {
        from: `"Expajo Admin" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Expajo Email Service Test',
        html: `
          <h2>Email Service Test</h2>
          <p>This is a test email to verify that the Expajo email service is working correctly.</p>
          <p>If you received this email, the configuration is successful!</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        `,
        text: `
Email Service Test

This is a test email to verify that the Expajo email service is working correctly.

If you received this email, the configuration is successful!

Timestamp: ${new Date().toISOString()}
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Test email sent successfully to ${to}:`, result.messageId);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to send test email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
