const translations = {
  vi: {
    // Header
    headerTitle: 'Chatbot AI tư vấn tuyển sinh của trường ĐH KHTN - ĐHQG HCM',
    aiStatus: 'AI đang hoạt động',
    toggleLight: 'Chuyển sang sáng',
    toggleDark: 'Chuyển sang tối',

    // Sidebar
    sidebarTitle: 'Chatbot AI',
    sidebarSubtitle: 'ĐH KHTN - ĐHQG HCM',
    hideSidebar: 'Ẩn sidebar',
    openSidebar: 'Mở sidebar',
    newChat: 'Cuộc trò chuyện mới',
    chatHistory: 'Lịch sử trò chuyện',
    noSessions: 'Chưa có cuộc trò chuyện nào',
    deleteSession: 'Xóa phiên',
    adminPanel: 'Quản trị Admin',

    // Welcome
    welcomeTitle: 'Xin chào! Tôi là Chatbot AI tư vấn tuyển sinh của trường ĐH KHTN - ĐHQG HCM',
    welcomeDesc: 'Tôi có thể giúp bạn tìm hiểu về ngành học, điểm chuẩn, học phí, ký túc xá và các thông tin tuyển sinh của Trường Đại học Khoa học Tự nhiên – ĐHQG TP.HCM.',

    // Suggestions
    suggestions: [
      '🔮 Em được 26 điểm A00, có đậu ngành CNTT không?',
      '🧭 Em thích lập trình, hướng nội, nên học ngành gì?',
      '📊 Điểm chuẩn năm 2025 của các ngành IT?',
      '💰 Học phí các ngành là bao nhiêu?',
      '🏠 Trường có ký túc xá nào?',
      '🏆 Có học bổng nào cho tân sinh viên không?',
    ],

    // Input
    inputPlaceholder: 'Nhập câu hỏi hoặc bấm 🎙️ để nói...',
    stopListening: 'Dừng nghe',
    startListening: 'Nói bằng giọng nói',
    sendMessage: 'Gửi tin nhắn',
    disclaimer: 'AI có thể mắc lỗi. Vui lòng xác minh thông tin quan trọng với nhà trường.',

    // Messages
    errorPrefix: '❌ Xin lỗi, đã xảy ra lỗi: ',
    errorSuffix: '. Vui lòng thử lại.',
    sourceLabel: 'Nguồn tham khảo:',
    page: 'tr.',

    // Predict Card
    predictTitle: 'Dự đoán khả năng đậu',
    predictMajor: 'Ngành xét:',
    predictScore: 'Điểm của bạn:',
    predictBenchmark: 'Điểm chuẩn 2025:',
    predictDiff: 'Chênh lệch:',
    predictPoints: 'điểm',
    predictProb: 'Tỷ lệ đậu ước tính',
    predictAlts: '💡 Ngành thay thế phù hợp hơn:',
    predictPass: 'đậu',
    predictNoData: 'Không tìm thấy dữ liệu phù hợp.',

    // Orient Card
    orientTitle: 'Gợi ý ngành học phù hợp',
    orientTuition: '💰',
    orientDifficulty: '📈 Độ khó:',
    orientJobs: '💼 Việc làm:',
    orientNoMatch: 'Chưa tìm được ngành phù hợp. Hãy thử mô tả thêm sở thích và thế mạnh của bạn nhé!',

    // Language
    langLabel: 'VI',
    speechLang: 'vi-VN',
  },

  en: {
    // Header
    headerTitle: 'AI Admission Counseling Chatbot - HCMUS (VNU-HCM)',
    aiStatus: 'AI is active',
    toggleLight: 'Switch to light mode',
    toggleDark: 'Switch to dark mode',

    // Sidebar
    sidebarTitle: 'AI Chatbot',
    sidebarSubtitle: 'HCMUS - VNU-HCM',
    hideSidebar: 'Hide sidebar',
    openSidebar: 'Open sidebar',
    newChat: 'New conversation',
    chatHistory: 'Chat history',
    noSessions: 'No conversations yet',
    deleteSession: 'Delete session',
    adminPanel: 'Admin Panel',

    // Welcome
    welcomeTitle: 'Hello! I\'m the AI Admission Counseling Chatbot of HCMUS (VNU-HCM)',
    welcomeDesc: 'I can help you learn about programs, admission scores, tuition fees, dormitories and admission information of the University of Science – Vietnam National University Ho Chi Minh City.',

    // Suggestions
    suggestions: [
      '🔮 I got 26 points in A00, can I pass the IT program?',
      '🧭 I like programming, introverted, what should I study?',
      '📊 What are the 2025 admission scores for IT programs?',
      '💰 How much is the tuition for each program?',
      '🏠 Does the university have dormitories?',
      '🏆 Are there scholarships for freshmen?',
    ],

    // Input
    inputPlaceholder: 'Type your question or press 🎙️ to speak...',
    stopListening: 'Stop listening',
    startListening: 'Speak by voice',
    sendMessage: 'Send message',
    disclaimer: 'AI may make mistakes. Please verify important information with the university.',

    // Messages
    errorPrefix: '❌ Sorry, an error occurred: ',
    errorSuffix: '. Please try again.',
    sourceLabel: 'References:',
    page: 'p.',

    // Predict Card
    predictTitle: 'Admission Prediction',
    predictMajor: 'Program:',
    predictScore: 'Your score:',
    predictBenchmark: 'Benchmark 2025:',
    predictDiff: 'Difference:',
    predictPoints: 'points',
    predictProb: 'Estimated admission rate',
    predictAlts: '💡 Better-fit alternative programs:',
    predictPass: 'pass',
    predictNoData: 'No matching data found.',

    // Orient Card
    orientTitle: 'Recommended Programs',
    orientTuition: '💰',
    orientDifficulty: '📈 Difficulty:',
    orientJobs: '💼 Career:',
    orientNoMatch: 'No matching program found. Try describing more about your interests and strengths!',

    // Language
    langLabel: 'EN',
    speechLang: 'en-US',
  },
};

export function getTranslations(lang) {
  return translations[lang] || translations.vi;
}

export default translations;
