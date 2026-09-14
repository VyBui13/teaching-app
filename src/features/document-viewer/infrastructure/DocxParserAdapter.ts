import mammoth from 'mammoth';
import { DocumentAggregate } from '../domain/DocumentAggregate';
import { DocumentPageVO } from '../domain/DocumentPageVO';

export class DocxParserAdapter {
  static async parse(file: File): Promise<DocumentAggregate> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const rawTextResult = await mammoth.extractRawText({ arrayBuffer });

    const html = result.value;
    const fullText = rawTextResult.value;

    const sections = html.split(/(?=<h[1-2]>)/g);
    const pages: DocumentPageVO[] = [];

    if (sections.length <= 1) {
      const paragraphs = html.split('</p>');
      let currentPageHtml = '';
      let pageIdx = 0;

      paragraphs.forEach((p, idx) => {
        currentPageHtml += p + (p.endsWith('</p>') ? '' : '</p>');
        if (currentPageHtml.length > 1400 || idx === paragraphs.length - 1) {
          pages.push(
            new DocumentPageVO({
              pageIndex: pageIdx,
              width: 800,
              height: 1100,
              htmlContent: `<div class="docx-page-content p-10 max-w-none prose prose-slate dark:prose-invert font-sans">${currentPageHtml}</div>`,
              textContent: currentPageHtml.replace(/<[^>]*>?/gm, ''),
            })
          );
          pageIdx++;
          currentPageHtml = '';
        }
      });
    } else {
      sections.forEach((secHtml, idx) => {
        pages.push(
          new DocumentPageVO({
            pageIndex: idx,
            width: 800,
            height: 1100,
            htmlContent: `<div class="docx-page-content p-10 max-w-none prose prose-slate dark:prose-invert font-sans">${secHtml}</div>`,
            textContent: secHtml.replace(/<[^>]*>?/gm, ''),
          })
        );
      });
    }

    if (pages.length === 0) {
      pages.push(
        new DocumentPageVO({
          pageIndex: 0,
          width: 800,
          height: 1100,
          htmlContent: `<div class="docx-page-content p-10 max-w-none prose prose-slate dark:prose-invert font-sans">${html}</div>`,
          textContent: fullText,
        })
      );
    }

    return DocumentAggregate.create({
      name: file.name,
      fileType: 'docx',
      sizeBytes: file.size,
      totalPages: pages.length,
      pages,
      uploadedAt: Date.now(),
    });
  }
}
