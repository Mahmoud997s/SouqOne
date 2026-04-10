import { Injectable, Logger } from '@nestjs/common';
import { MailtrapClient } from 'mailtrap';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private client: MailtrapClient;

  constructor() {
    this.client = new MailtrapClient({
      token: process.env.MAILTRAP_API_TOKEN || '',
    });
  }

  async sendVerificationEmail(to: string, code: string): Promise<void> {
    try {
      await this.client.send({
        from: { email: 'hello@demomailtrap.co', name: 'كار وان' },
        to: [{ email: to }],
        subject: 'رمز التحقق — كار وان',
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border-radius: 16px; background: #f8f9fa;">
            <h2 style="color: #1565c0; margin-bottom: 8px;">كار وان 🚗</h2>
            <p style="color: #333; font-size: 16px;">مرحباً! رمز التحقق الخاص بك هو:</p>
            <div style="background: #1565c0; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 16px; border-radius: 12px; margin: 24px 0;">
              ${code}
            </div>
            <p style="color: #666; font-size: 14px;">هذا الرمز صالح لمدة 15 دقيقة.</p>
            <p style="color: #999; font-size: 12px;">إذا لم تطلب هذا الرمز، تجاهل هذه الرسالة.</p>
          </div>
        `,
      });
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error);
    }
  }

  async sendPasswordResetEmail(to: string, code: string): Promise<void> {
    try {
      await this.client.send({
        from: { email: 'hello@demomailtrap.co', name: 'كار وان' },
        to: [{ email: to }],
        subject: 'إعادة تعيين كلمة المرور — كار وان',
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border-radius: 16px; background: #f8f9fa;">
            <h2 style="color: #1565c0; margin-bottom: 8px;">كار وان 🚗</h2>
            <p style="color: #333; font-size: 16px;">طلبت إعادة تعيين كلمة المرور. رمز التحقق هو:</p>
            <div style="background: #1565c0; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 16px; border-radius: 12px; margin: 24px 0;">
              ${code}
            </div>
            <p style="color: #666; font-size: 14px;">هذا الرمز صالح لمدة 15 دقيقة فقط.</p>
            <p style="color: #999; font-size: 12px;">إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل هذه الرسالة.</p>
          </div>
        `,
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}`, error);
    }
  }
}
