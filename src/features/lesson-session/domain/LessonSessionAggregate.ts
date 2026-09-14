import { Entity } from '../../../core/domain/Entity';
import { DocumentAggregate } from '../../document-viewer/domain/DocumentAggregate';
import { AnnotationEntity } from '../../annotation-canvas/domain/AnnotationEntity';

export interface LessonSessionProps {
  version: string;
  sessionId: string;
  title: string;
  subject?: string;
  createdAt: number;
  lastModifiedAt: number;
  document: DocumentAggregate | null;
  annotations: Record<number, AnnotationEntity[]>;
  teacherNotes: Record<number, string>;
  studentList: string[];
}

export class LessonSessionAggregate extends Entity<LessonSessionProps> {
  static create(props: LessonSessionProps, id?: string): LessonSessionAggregate {
    return new LessonSessionAggregate(props, id);
  }

  get title(): string {
    return this.props.title;
  }

  set title(val: string) {
    this.props.title = val;
    this.props.lastModifiedAt = Date.now();
  }

  get document(): DocumentAggregate | null {
    return this.props.document;
  }

  get annotations(): Record<number, AnnotationEntity[]> {
    return this.props.annotations;
  }

  get teacherNotes(): Record<number, string> {
    return this.props.teacherNotes;
  }

  get studentList(): string[] {
    return this.props.studentList;
  }

  set studentList(list: string[]) {
    this.props.studentList = list;
    this.props.lastModifiedAt = Date.now();
  }

  get lastModifiedAt(): number {
    return this.props.lastModifiedAt;
  }

  setDocument(doc: DocumentAggregate | null) {
    this.props.document = doc;
    this.props.lastModifiedAt = Date.now();
  }

  setAnnotationsForPage(pageIndex: number, annotations: AnnotationEntity[]) {
    this.props.annotations[pageIndex] = annotations;
    this.props.lastModifiedAt = Date.now();
  }

  setTeacherNote(pageIndex: number, note: string) {
    this.props.teacherNotes[pageIndex] = note;
    this.props.lastModifiedAt = Date.now();
  }

  getTotalAnnotationCount(): number {
    let count = 0;
    Object.values(this.props.annotations).forEach((arr) => {
      count += arr.length;
    });
    return count;
  }

  clone(): LessonSessionAggregate {
    return LessonSessionAggregate.create(
      {
        version: this.props.version,
        sessionId: this.props.sessionId,
        title: this.props.title,
        subject: this.props.subject,
        createdAt: this.props.createdAt,
        lastModifiedAt: Date.now(),
        document: this.props.document,
        annotations: { ...this.props.annotations },
        teacherNotes: { ...this.props.teacherNotes },
        studentList: [...this.props.studentList],
      },
      this.id
    );
  }
}
