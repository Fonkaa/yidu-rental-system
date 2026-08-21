import api from './api';

export const messageService = {
  getConversations: () => api.get('/messages'),
  getConversation: (id) => api.get(`/messages/${id}`),
  sendMessage: (payload) => api.post('/messages', payload)
};
