import { useState, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'itinerary';
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export const useChat = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [
      {
        id: '1',
        content: 'Tôi muốn đi du lịch thành phố Hồ Chí Minh đến Đà Lạt 3 ngày 2 đêm chơi gì ? 3 đâu? Du lịch gia đình 4 người 2 người lớn, 2 trẻ em, 1 con thú cưng, ngân sách khoảng 15 triệu',
        sender: 'user',
        timestamp: new Date(),
        type: 'text'
      },
      {
        id: '2',
        content: 'Cảm ơn bạn đã chia sẻ thông tin! Tôi sẽ tạo ra hành trình cụ của bạn. Gia đình 4 người lớn 2 trẻ em cùng một chú mèo muốn đi du lịch từ Thành phố Hồ Chí Minh đến Đà Lạt trong 3 ngày 2 đêm, với ngân sách khoảng 15 triệu đồng và thú cưng đi cùng. Hãy để tôi tạo một kế hoạch chi tiết cho chuyến đi này.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'itinerary'
      }
    ],
    isLoading: false,
    error: null
  });

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null
    }));

    try {
      // Simulate API call to chat service
      await new Promise(resolve => setTimeout(resolve, 1500));

      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: generateBotResponse(content),
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, botResponse],
        isLoading: false
      }));
    } catch (error) {
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.'
      }));
    }
  }, []);

  const clearMessages = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      messages: [],
      error: null
    }));
  }, []);

  const clearError = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  return {
    ...chatState,
    sendMessage,
    clearMessages,
    clearError
  };
};

// Helper function to generate bot responses
const generateBotResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('du lịch') || lowerMessage.includes('đi chơi')) {
    return 'Tôi có thể giúp bạn lên kế hoạch du lịch! Bạn có thể cho tôi biết thêm về điểm đến, thời gian và ngân sách của bạn không?';
  }
  
  if (lowerMessage.includes('khách sạn') || lowerMessage.includes('nghỉ dưỡng')) {
    return 'Tôi sẽ tìm kiếm các khách sạn phù hợp với yêu cầu của bạn. Bạn có sở thích gì đặc biệt về loại hình lưu trú không?';
  }
  
  if (lowerMessage.includes('ăn uống') || lowerMessage.includes('nhà hàng')) {
    return 'Tôi có thể gợi ý những nhà hàng và món ăn đặc sản địa phương tuyệt vời! Bạn có loại ẩm thực yêu thích nào không?';
  }
  
  return 'Cảm ơn bạn đã chia sẻ! Tôi sẽ cố gắng hỗ trợ bạn tốt nhất có thể. Bạn có thể hỏi tôi về du lịch, khách sạn, nhà hàng, hoặc bất kỳ điều gì khác.';
};
