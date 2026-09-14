import * as pdfjsLib from 'pdfjs-dist';
import { DocumentAggregate } from '../domain/DocumentAggregate';
import { DocumentPageVO } from '../domain/DocumentPageVO';

// Configure PDF.js worker CDN fallback
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export class PdfParserAdapter {
  static async parse(file: File): Promise<DocumentAggregate> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdfDoc.numPages;
    const pages: DocumentPageVO[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });

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

      let pageText = '';
      try {
        const textContent = await page.getTextContent();
        pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ');
      } catch {
        pageText = '';
      }

      pages.push(
        new DocumentPageVO({
          pageIndex: i - 1,
          width: viewport.width,
          height: viewport.height,
          dataUrl: canvas.toDataURL('image/png'),
          textContent: pageText,
        })
      );
    }

    return DocumentAggregate.create({
      name: file.name,
      fileType: 'pdf',
      sizeBytes: file.size,
      totalPages: numPages,
      pages,
      uploadedAt: Date.now(),
    });
  }
}
