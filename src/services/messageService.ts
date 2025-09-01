import api from './api';

export interface MessageData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const messageService = {
  // Send a contact message
  sendContactMessage: async (messageData: MessageData) => {
    const response = await api.post('/api/messages/contact', messageData);
    return response.data;
  },
};

export default messageService;