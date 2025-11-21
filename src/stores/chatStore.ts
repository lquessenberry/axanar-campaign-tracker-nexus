import { create } from 'zustand';

interface ChatState {
  selectedConversationId: string | null;
  showUserSelector: boolean;
  activeTab: 'all' | 'support';
  setSelectedConversation: (id: string | null) => void;
  setShowUserSelector: (show: boolean) => void;
  setActiveTab: (tab: 'all' | 'support') => void;
}

export const useChatStore = create<ChatState>((set) => ({
  selectedConversationId: null,
  showUserSelector: false,
  activeTab: 'all',
  setSelectedConversation: (id) => set({ selectedConversationId: id }),
  setShowUserSelector: (show) => set({ showUserSelector: show }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
