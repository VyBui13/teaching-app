import { ValueObject } from '../../../core/domain/ValueObject';

export interface DocumentPageProps {
  pageIndex: number;
  width: number;
  height: number;
  dataUrl?: string;
  htmlContent?: string;
  textContent?: string;
}

export class DocumentPageVO extends ValueObject<DocumentPageProps> {
  get pageIndex(): number {
    return this.props.pageIndex;
  }

  get width(): number {
    return this.props.width;
  }

  get height(): number {
    return this.props.height;
  }

  get dataUrl(): string | undefined {
    return this.props.dataUrl;
  }

  get htmlContent(): string | undefined {
    return this.props.htmlContent;
  }

  get textContent(): string | undefined {
    return this.props.textContent;
  }
}
