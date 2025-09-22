import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { LegalService } from './legal.service';

@Controller('legal')
export class LegalController {
  constructor(private readonly legalService: LegalService) {}

  @Get()
  async getLegalDocuments(@Res() res: Response): Promise<void> {
    const html = await this.legalService.generateLegalDocumentsHtml();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  @Get('privacy')
  async getPrivacyPolicy(@Res() res: Response): Promise<void> {
    const html = await this.legalService.generatePrivacyPolicyHtml();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  @Get('terms')
  async getTermsOfService(@Res() res: Response): Promise<void> {
    const html = await this.legalService.generateTermsOfServiceHtml();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
