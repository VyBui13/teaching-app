import JSZip from 'jszip';
import { DocumentAggregate } from '../domain/DocumentAggregate';
import { DocumentPageVO } from '../domain/DocumentPageVO';

export class PptxParserAdapter {
  static async parse(file: File): Promise<DocumentAggregate> {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    // Find all slide files ppt/slides/slide1.xml, slide2.xml ...
    const slideFiles = Object.keys(zip.files)
      .filter((filename) => /^ppt\/slides\/slide\d+\.xml$/i.test(filename))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
        const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
        return numA - numB;
      });

    const pages: DocumentPageVO[] = [];

    if (slideFiles.length === 0) {
      // Fallback if no slides XML found
      pages.push(
        new DocumentPageVO({
          pageIndex: 0,
          width: 960,
          height: 540,
          htmlContent: `
            <div class="p-10 text-center font-sans space-y-4">
              <h2 class="text-2xl font-bold text-indigo-400">PowerPoint Presentation</h2>
              <p class="text-sm text-slate-300">${file.name}</p>
            </div>
          `,
          textContent: file.name,
        })
      );
    } else {
      for (let i = 0; i < slideFiles.length; i++) {
        const slidePath = slideFiles[i];
        const xmlText = await zip.file(slidePath)?.async('string');
        
        // Extract text inside <a:t> tags
        const textMatches = xmlText ? xmlText.match(/<a:t[^>]*>(.*?)<\/a:t>/g) : [];
        const extractedStrings = textMatches
          ? textMatches.map((tag) => tag.replace(/<[^>]+>/g, '').trim()).filter(Boolean)
          : [];

        const title = extractedStrings[0] || `Slide ${i + 1}`;
        const bodyParagraphs = extractedStrings.slice(1);

        const slideHtml = `
          <div class="p-12 h-full flex flex-col justify-center space-y-6 font-sans text-slate-100 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
            <div className="border-b border-indigo-500/30 pb-4">
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-semibold uppercase tracking-wider">Slide ${i + 1}</span>
              <h1 className="text-3xl font-extrabold mt-2 text-indigo-300 leading-tight">${title}</h1>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto">
              ${
                bodyParagraphs.length > 0
                  ? bodyParagraphs
                      .map(
                        (p) =>
                          `<div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 flex items-start gap-2">
                             <span className="text-indigo-400 font-bold">•</span>
                             <span>${p}</span>
                           </div>`
                      )
                      .join('')
                  : `<p className="text-sm text-slate-500 italic">Trang slide minh họa trực quan.</p>`
              }
            </div>
          </div>
        `;

        pages.push(
          new DocumentPageVO({
            pageIndex: i,
            width: 960,
            height: 540,
            htmlContent: slideHtml,
            textContent: extractedStrings.join(' '),
          })
        );
      }
    }

    return DocumentAggregate.create({
      name: file.name,
      fileType: 'pdf', // treating as slide doc
      sizeBytes: file.size,
      totalPages: pages.length,
      pages,
      uploadedAt: Date.now(),
    });
  }
}
