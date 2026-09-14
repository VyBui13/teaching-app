import { Entity } from '../../../core/domain/Entity';
import { DocumentPageVO } from './DocumentPageVO';

export interface DocumentProps {
  name: string;
  fileType: 'pdf' | 'docx' | 'sample';
  sizeBytes: number;
  totalPages: number;
  pages: DocumentPageVO[];
  uploadedAt: number;
}

export class DocumentAggregate extends Entity<DocumentProps> {
  static create(props: DocumentProps, id?: string): DocumentAggregate {
    return new DocumentAggregate(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get fileType(): 'pdf' | 'docx' | 'sample' {
    return this.props.fileType;
  }

  get sizeBytes(): number {
    return this.props.sizeBytes;
  }

  get totalPages(): number {
    return this.props.totalPages;
  }

  get pages(): DocumentPageVO[] {
    return this.props.pages;
  }

  get uploadedAt(): number {
    return this.props.uploadedAt;
  }

  getPage(index: number): DocumentPageVO | null {
    if (index < 0 || index >= this.props.pages.length) return null;
    return this.props.pages[index];
  }
}
