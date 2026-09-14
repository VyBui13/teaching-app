import * as pdfjsLib from 'pdfjs-dist';
import type { DocumentInfo, DocumentPage } from '../types/document';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function parsePdfFile(file: File): Promise<DocumentInfo> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdfDoc.numPages;
  const pages: DocumentPage[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });

    // Render page to canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (context) {
      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      } as any).promise;
    }

    // Extract text content for AI feature
    let pageText = '';
    try {
      const textContent = await page.getTextContent();
      pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
    } catch {
      pageText = '';
    }

    pages.push({
      pageIndex: i - 1,
      width: viewport.width,
      height: viewport.height,
      dataUrl: canvas.toDataURL('image/png'),
      textContent: pageText,
    });
  }

  return {
    id: `doc_${Date.now()}`,
    name: file.name,
    fileType: 'pdf',
    sizeBytes: file.size,
    totalPages: numPages,
    pages,
    uploadedAt: Date.now(),
  };
}
