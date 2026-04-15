import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private readonly fromAddress: string;
  private readonly fromName = 'سوق وان';

  constructor() {
    const host = process.env.MAIL_HOST;
    const port = parseInt(process.env.MAIL_PORT || '465', 10);
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;
    this.fromAddress = process.env.MAIL_FROM || user || 'noreply@souqone.com';

    if (!host || !user || !pass) {
      this.logger.warn('MAIL_HOST/MAIL_USER/MAIL_PASS not set — emails will be logged but not sent');
    } else {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`Mail transporter configured → ${host}:${port} as ${user}`);
    }
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`[DEV] Email to ${to} | Subject: ${subject}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromAddress}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to} | Subject: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }

  async sendVerificationEmail(to: string, code: string): Promise<void> {
    const html = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border-radius: 16px; background: #f8f9fa;">
        <h2 style="color: #1565c0; margin-bottom: 8px;">سوق وان 🚗</h2>
        <p style="color: #333; font-size: 16px;">مرحباً! رمز التحقق الخاص بك هو:</p>
        <div style="background: #1565c0; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 16px; border-radius: 12px; margin: 24px 0;">
          ${code}
        </div>
        <p style="color: #666; font-size: 14px;">هذا الرمز صالح لمدة 15 دقيقة.</p>
        <p style="color: #999; font-size: 12px;">إذا لم تطلب هذا الرمز، تجاهل هذه الرسالة.</p>
      </div>
    `;
    await this.send(to, 'رمز التحقق — سوق وان', html);
  }

  async sendPasswordResetEmail(to: string, code: string): Promise<void> {
    const html = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border-radius: 16px; background: #f8f9fa;">
        <h2 style="color: #1565c0; margin-bottom: 8px;">سوق وان 🚗</h2>
        <p style="color: #333; font-size: 16px;">طلبت إعادة تعيين كلمة المرور. رمز التحقق هو:</p>
        <div style="background: #1565c0; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 16px; border-radius: 12px; margin: 24px 0;">
          ${code}
        </div>
        <p style="color: #666; font-size: 14px;">هذا الرمز صالح لمدة 15 دقيقة فقط.</p>
        <p style="color: #999; font-size: 12px;">إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل هذه الرسالة.</p>
      </div>
    `;
    await this.send(to, 'إعادة تعيين كلمة المرور — سوق وان', html);
  }
}
