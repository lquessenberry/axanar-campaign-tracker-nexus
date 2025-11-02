import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
  isOpen: boolean;
  recipientId: string | null;
  recipientName: string | null;
  recipientUsername: string | null;
  openChat: (userId: string, name: string, username?: string) => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [recipientUsername, setRecipientUsername] = useState<string | null>(null);

  const openChat = (userId: string, name: string, username?: string) => {
    setRecipientId(userId);
    setRecipientName(name);
    setRecipientUsername(username || null);
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        recipientId,
        recipientName,
        recipientUsername,
        openChat,
        closeChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
