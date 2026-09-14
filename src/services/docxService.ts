import mammoth from 'mammoth';
import type { DocumentInfo, DocumentPage } from '../types/document';

export async function parseDocxFile(file: File): Promise<DocumentInfo> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Convert docx to HTML
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const rawTextResult = await mammoth.extractRawText({ arrayBuffer });

  const html = result.value;
  const fullText = rawTextResult.value;

  // Split HTML into logical sections/pages by <h1> or <hr> or paragraphs chunking
  const sections = html.split(/(?=<h[1-2]>)/g);
  const pages: DocumentPage[] = [];

  if (sections.length <= 1) {
    // If no headings found, split text into ~1200 character chunks per page
    const paragraphs = html.split('</p>');
    let currentPageHtml = '';
    let pageIdx = 0;

    paragraphs.forEach((p, idx) => {
      currentPageHtml += p + (p.endsWith('</p>') ? '' : '</p>');
      if (currentPageHtml.length > 1500 || idx === paragraphs.length - 1) {
        pages.push({
          pageIndex: pageIdx,
          width: 800,
          height: 1100,
          htmlContent: `<div class="docx-page-content p-8 max-w-none text-slate-800 dark:text-slate-100">${currentPageHtml}</div>`,
          textContent: currentPageHtml.replace(/<[^>]*>?/gm, ''),
        });
        pageIdx++;
        currentPageHtml = '';
      }
    });
  } else {
    sections.forEach((secHtml, idx) => {
      pages.push({
        pageIndex: idx,
        width: 800,
        height: 1100,
        htmlContent: `<div class="docx-page-content p-8 max-w-none text-slate-800 dark:text-slate-100">${secHtml}</div>`,
        textContent: secHtml.replace(/<[^>]*>?/gm, ''),
      });
    });
  }

  if (pages.length === 0) {
    pages.push({
      pageIndex: 0,
      width: 800,
      height: 1100,
      htmlContent: `<div class="docx-page-content p-8 text-slate-800 dark:text-slate-100">${html}</div>`,
      textContent: fullText,
    });
  }

  return {
    id: `doc_${Date.now()}`,
    name: file.name,
    fileType: 'docx',
    sizeBytes: file.size,
    totalPages: pages.length,
    pages,
    uploadedAt: Date.now(),
  };
}
