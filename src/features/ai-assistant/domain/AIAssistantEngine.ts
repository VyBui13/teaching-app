export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface AIAnalysisResult {
  summary: string;
  keyPoints: string[];
  quizzes: QuizItem[];
  discussionQuestions: string[];
}

export class AIAssistantEngine {
  static analyzePageText(textContent: string, pageIndex: number): AIAnalysisResult {
    const cleanText = textContent.trim();
    if (!cleanText || cleanText.length < 15) {
      return {
        summary: `Nội dung trang ${pageIndex + 1} hiện tại là sơ đồ hoặc hình ảnh minh họa.`,
        keyPoints: ['Quan sát trực quan hình ảnh minh họa trên trang', 'Sử dụng bút vẽ để ghi chú bổ sung'],
        quizzes: [
          {
            id: `q_${Date.now()}_1`,
            question: `Trọng tâm trực quan của trang ${pageIndex + 1} thể hiện điều gì?`,
            options: ['Sơ đồ minh họa khái niệm', 'Bảng thông số chi tiết', 'Danh sách bài tập tự luyện', 'Đoạn văn bản lý thuyết'],
            correctAnswer: 0,
            explanation: 'Trang chứa sơ đồ/hình ảnh trực quan hỗ trợ việc học trực diện.',
          },
        ],
        discussionQuestions: [
          'Em hãy mô tả ý nghĩa của sơ đồ trên theo cách hiểu của em?',
          'Chi tiết nào trên sơ đồ gây ấn tượng nhất cho em?',
        ],
      };
    }

    // Extract key sentences
    const sentences = cleanText
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 5);

    const summary =
      sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '.' : '');

    const keyPoints = sentences.length >= 2 ? sentences.slice(0, 4) : [cleanText];

    // Generate smart quiz from page context
    const quiz1: QuizItem = {
      id: `q_${Date.now()}_1`,
      question: `Ý chính nào được đề cập đầu tiên trong trang ${pageIndex + 1}?`,
      options: [
        sentences[0] || 'Nội dung cốt lõi của bài học',
        'Phương pháp nghiên cứu thực nghiệm',
        'Lịch sử phát triển ngành',
        'Các ví dụ minh họa ngoại lệ',
      ],
      correctAnswer: 0,
      explanation: `Dựa vào văn bản: "${(sentences[0] || '').substring(0, 60)}..."`,
    };

    const quiz2: QuizItem = {
      id: `q_${Date.now()}_2`,
      question: `Thuật ngữ hoặc khái niệm nào xuất hiện chính trong bài?`,
      options: [
        keyPoints[1] || keyPoints[0] || 'Khái niệm chính',
        'Phân tích ma trận SWOT',
        'Thuật toán sắp xếp',
        'Định lý Pythagore',
      ],
      correctAnswer: 0,
      explanation: 'Đây là luận điểm trọng tâm được trình bày trong trang.',
    };

    return {
      summary: summary || 'Tóm tắt nội dung chính của trang bài giảng.',
      keyPoints,
      quizzes: [quiz1, quiz2],
      discussionQuestions: [
        `Hãy liên hệ nội dung "${(sentences[0] || 'bài học').substring(0, 40)}" với thực tế cuộc sống?`,
        'Nếu áp dụng kiến thức này vào bài tập lớn, em sẽ bắt đầu từ đâu?',
      ],
    };
  }
}
