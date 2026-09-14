import { LessonSessionAggregate } from './LessonSessionAggregate';
import { DocumentAggregate } from '../../document-viewer/domain/DocumentAggregate';
import { DocumentPageVO } from '../../document-viewer/domain/DocumentPageVO';
import { AnnotationEntity } from '../../annotation-canvas/domain/AnnotationEntity';

export interface ExportedTeachFilePayload {
  format: 'TEACH_APP_V1';
  exportedAt: number;
  appVersion: string;
  session: {
    sessionId: string;
    title: string;
    createdAt: number;
    lastModifiedAt: number;
    studentList: string[];
    teacherNotes: Record<number, string>;
    document: {
      id: string;
      name: string;
      fileType: 'pdf' | 'docx' | 'sample';
      sizeBytes: number;
      totalPages: number;
      uploadedAt: number;
      pages: Array<{
        pageIndex: number;
        width: number;
        height: number;
        dataUrl?: string;
        htmlContent?: string;
        textContent?: string;
      }>;
    } | null;
    annotations: Record<number, any[]>;
  };
}

export class TeachFileSchema {
  static serialize(aggregate: LessonSessionAggregate): ExportedTeachFilePayload {
    const doc = aggregate.document;
    const annotationsRaw: Record<number, any[]> = {};

    Object.entries(aggregate.annotations).forEach(([pageIdx, items]) => {
      annotationsRaw[Number(pageIdx)] = items.map((a) => a.toJSON());
    });

    return {
      format: 'TEACH_APP_V1',
      exportedAt: Date.now(),
      appVersion: '1.0.0',
      session: {
        sessionId: aggregate.id,
        title: aggregate.title,
        createdAt: aggregate.lastModifiedAt,
        lastModifiedAt: aggregate.lastModifiedAt,
        studentList: aggregate.studentList,
        teacherNotes: aggregate.teacherNotes,
        document: doc
          ? {
              id: doc.id,
              name: doc.name,
              fileType: doc.fileType,
              sizeBytes: doc.sizeBytes,
              totalPages: doc.totalPages,
              uploadedAt: doc.uploadedAt,
              pages: doc.pages.map((p) => ({
                pageIndex: p.pageIndex,
                width: p.width,
                height: p.height,
                dataUrl: p.dataUrl,
                htmlContent: p.htmlContent,
                textContent: p.textContent,
              })),
            }
          : null,
        annotations: annotationsRaw,
      },
    };
  }

  static deserialize(payload: ExportedTeachFilePayload): LessonSessionAggregate {
    if (payload.format !== 'TEACH_APP_V1') {
      throw new Error('Định dạng file không tương thích với phiên bản hiện tại.');
    }

    const sess = payload.session;
    let docAggregate: DocumentAggregate | null = null;

    if (sess.document) {
      const pageVOs = sess.document.pages.map(
        (p) =>
          new DocumentPageVO({
            pageIndex: p.pageIndex,
            width: p.width,
            height: p.height,
            dataUrl: p.dataUrl,
            htmlContent: p.htmlContent,
            textContent: p.textContent,
          })
      );

      docAggregate = DocumentAggregate.create(
        {
          name: sess.document.name,
          fileType: sess.document.fileType,
          sizeBytes: sess.document.sizeBytes,
          totalPages: sess.document.totalPages,
          pages: pageVOs,
          uploadedAt: sess.document.uploadedAt,
        },
        sess.document.id
      );
    }

    const annotationsEntities: Record<number, AnnotationEntity[]> = {};
    Object.entries(sess.annotations || {}).forEach(([pageIdxStr, items]) => {
      const idx = Number(pageIdxStr);
      annotationsEntities[idx] = (items || []).map((item) =>
        AnnotationEntity.create(
          {
            pageIndex: item.pageIndex,
            type: item.type,
            color: item.color,
            strokeWidth: item.strokeWidth,
            opacity: item.opacity,
            points: item.points,
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
            text: item.text,
            fontSize: item.fontSize,
            fillColor: item.fillColor,
            createdAt: item.createdAt || Date.now(),
            updatedAt: item.updatedAt || Date.now(),
          },
          item.id
        )
      );
    });

    return LessonSessionAggregate.create(
      {
        version: '1.0',
        sessionId: sess.sessionId,
        title: sess.title || 'Bài Giảng Đã Import',
        createdAt: sess.createdAt || Date.now(),
        lastModifiedAt: sess.lastModifiedAt || Date.now(),
        document: docAggregate,
        annotations: annotationsEntities,
        teacherNotes: sess.teacherNotes || {},
        studentList: sess.studentList || [],
      },
      sess.sessionId
    );
  }
}
