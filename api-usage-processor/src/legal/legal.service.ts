import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { marked } from 'marked';

@Injectable()
export class LegalService {
  private readonly basePath = path.join(process.cwd(), 'public', 'legal');

  async generateLegalDocumentsHtml(): Promise<string> {
    const apiPrivacyPolicy = await this.readMarkdownFile('api-privacy-policy.md');
    const apiTermsOfService = await this.readMarkdownFile('api-terms-of-service.md');
    const uiPrivacyPolicy = await this.readMarkdownFile('ui-privacy-policy.md');
    const uiTermsOfService = await this.readMarkdownFile('ui-terms-of-service.md');

    return this.generateHtmlTemplate({
      title: 'Legal Documents - Team Guideline Pulse',
      content: `
        <div class="container">
          <header>
            <h1>Legal Documents</h1>
            <p class="subtitle">Team Guideline Pulse - Terms of Service and Privacy Policies</p>
          </header>

          <nav class="toc">
            <h2>Table of Contents</h2>
            <ul>
              <li><a href="#api-documents">API Documents</a></li>
              <li><a href="#ui-documents">Extension Documents</a></li>
            </ul>
          </nav>

          <section id="api-documents" class="document-section">
            <h2>API Documents</h2>
            <p class="section-description">Legal documents for the Team Guideline Pulse API service.</p>
            
            <div class="document-group">
              <h3>Privacy Policy</h3>
              <div class="document-content">
                ${apiPrivacyPolicy}
              </div>
            </div>

            <div class="document-group">
              <h3>Terms of Service</h3>
              <div class="document-content">
                ${apiTermsOfService}
              </div>
            </div>
          </section>

          <section id="ui-documents" class="document-section">
            <h2>Extension Documents</h2>
            <p class="section-description">Legal documents for the Team Guideline Pulse browser extension.</p>
            
            <div class="document-group">
              <h3>Privacy Policy</h3>
              <div class="document-content">
                ${uiPrivacyPolicy}
              </div>
            </div>

            <div class="document-group">
              <h3>Terms of Service</h3>
              <div class="document-content">
                ${uiTermsOfService}
              </div>
            </div>
          </section>

          <footer>
            <p class="last-updated">Last updated: ${new Date().toLocaleDateString()}</p>
            <p class="contact-info">
              For questions about these documents, please contact us at 
              <a href="mailto:privacy@teamguidelinepulse.com">privacy@teamguidelinepulse.com</a>
            </p>
          </footer>
        </div>
      `
    });
  }

  async generatePrivacyPolicyHtml(): Promise<string> {
    const apiPrivacyPolicy = await this.readMarkdownFile('api-privacy-policy.md');
    const uiPrivacyPolicy = await this.readMarkdownFile('ui-privacy-policy.md');

    return this.generateHtmlTemplate({
      title: 'Privacy Policy - Team Guideline Pulse',
      content: `
        <div class="container">
          <header>
            <h1>Privacy Policy</h1>
            <p class="subtitle">Team Guideline Pulse - Data Protection and Privacy</p>
          </header>

          <section class="document-section">
            <h2>API Privacy Policy</h2>
            <div class="document-content">
              ${apiPrivacyPolicy}
            </div>
          </section>

          <section class="document-section">
            <h2>Extension Privacy Policy</h2>
            <div class="document-content">
              ${uiPrivacyPolicy}
            </div>
          </section>
        </div>
      `
    });
  }

  async generateTermsOfServiceHtml(): Promise<string> {
    const apiTermsOfService = await this.readMarkdownFile('api-terms-of-service.md');
    const uiTermsOfService = await this.readMarkdownFile('ui-terms-of-service.md');

    return this.generateHtmlTemplate({
      title: 'Terms of Service - Team Guideline Pulse',
      content: `
        <div class="container">
          <header>
            <h1>Terms of Service</h1>
            <p class="subtitle">Team Guideline Pulse - Service Terms and Conditions</p>
          </header>

          <section class="document-section">
            <h2>API Terms of Service</h2>
            <div class="document-content">
              ${apiTermsOfService}
            </div>
          </section>

          <section class="document-section">
            <h2>Extension Terms of Service</h2>
            <div class="document-content">
              ${uiTermsOfService}
            </div>
          </section>
        </div>
      `
    });
  }

  private async readMarkdownFile(relativePath: string): Promise<string> {
    try {
      const fullPath = path.join(this.basePath, relativePath);
      const content = await fs.promises.readFile(fullPath, 'utf-8');
      return marked(content);
    } catch (error) {
      console.error(`Error reading file ${relativePath}:`, error);
      return `<h1>Error</h1><p>Could not load document: ${relativePath}</p>`;
    }
  }

  private generateHtmlTemplate({ title, content }: { title: string; content: string }): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
        .container { max-width: 1200px; margin: 20px auto; padding: 20px; background-color: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); border-radius: 8px; }
        header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e9ecef; }
        h1 { color: #2c3e50; font-size: 2.5rem; margin-bottom: 10px; }
        .subtitle { color: #6c757d; font-size: 1.1rem; }
        .toc { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 40px; }
        .toc h2 { color: #495057; margin-bottom: 15px; }
        .toc ul { list-style: none; }
        .toc li { margin-bottom: 8px; }
        .toc a { color: #007bff; text-decoration: none; font-weight: 500; }
        .toc a:hover { text-decoration: underline; }
        .document-section { margin-bottom: 50px; padding: 30px; border: 1px solid #e9ecef; border-radius: 8px; background-color: #fafafa; }
        .document-section h2 { color: #2c3e50; font-size: 2rem; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #dee2e6; }
        .section-description { color: #6c757d; font-style: italic; margin-bottom: 25px; }
        .document-group { margin-bottom: 40px; padding: 25px; background-color: white; border-radius: 6px; border-left: 4px solid #007bff; }
        .document-group h3 { color: #495057; font-size: 1.5rem; margin-bottom: 20px; }
        .document-content { line-height: 1.7; }
        .document-content h1 { color: #2c3e50; font-size: 1.8rem; margin-bottom: 20px; margin-top: 30px; }
        .document-content h2 { color: #34495e; font-size: 1.5rem; margin-bottom: 15px; margin-top: 25px; }
        .document-content h3 { color: #495057; font-size: 1.3rem; margin-bottom: 12px; margin-top: 20px; }
        .document-content p { margin-bottom: 15px; text-align: justify; }
        .document-content ul { margin-bottom: 15px; padding-left: 20px; }
        .document-content li { margin-bottom: 8px; }
        .document-content strong { color: #2c3e50; font-weight: 600; }
        .document-content em { color: #6c757d; font-style: italic; }
        .document-content code { background-color: #f8f9fa; padding: 2px 6px; border-radius: 3px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 0.9em; color: #e83e8c; }
        .document-content pre { background-color: #f8f9fa; padding: 15px; border-radius: 6px; overflow-x: auto; margin-bottom: 15px; }
        .document-content pre code { background-color: transparent; padding: 0; color: #495057; }
        .document-content a { color: #007bff; text-decoration: none; }
        .document-content a:hover { text-decoration: underline; }
        footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #e9ecef; text-align: center; color: #6c757d; }
        .last-updated { font-weight: 500; margin-bottom: 10px; }
        .contact-info a { color: #007bff; text-decoration: none; }
        .contact-info a:hover { text-decoration: underline; }
        @media (max-width: 768px) { .container { margin: 10px; padding: 15px; } h1 { font-size: 2rem; } .document-section { padding: 20px; } .document-group { padding: 20px; } }
    </style>
</head>
<body>${content}</body>
</html>`;
  }
}
