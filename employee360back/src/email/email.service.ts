import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'malek.benrayana@polytechnicien.tn',
        pass: 'vvrn fmil dlye nspl',
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<void> {
    const mailOptions = {
      from: 'malek.benrayana@polytechnicien.tn',
      to,
      subject,
      text,
      html,
    };

    try {
      await this.transporter.verify();
      this.logger.log('Transporteur prêt à envoyer des emails.');

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email envoyé à ${to}`);
    } catch (error) {
      this.logger.error("Erreur lors de l'envoi de l'email", error.stack);
      this.logger.error(`Erreur détaillée: ${error.message}`);
      throw new Error("Erreur lors de l'envoi de l'email");
    }
  }
}
