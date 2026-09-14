export interface DocumentPage {
  pageIndex: number;
  width: number;
  height: number;
  dataUrl?: string; // Rendered image data URL for high-performance viewing
  htmlContent?: string; // HTML content if converted from Word (.docx)
  textContent?: string; // Plain text extracted for AI processing
}

export interface DocumentInfo {
  id: string;
  name: string;
  fileType: 'pdf' | 'docx' | 'sample';
  sizeBytes: number;
  totalPages: number;
  pages: DocumentPage[];
  uploadedAt: number;
}
