import React, { useEffect, useRef } from 'react';
import type { Message } from '../types.ts';
import { Role } from '../types.ts';
import { MessageBubble } from './MessageBubble.tsx';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, index) => (
        <MessageBubble key={index} message={msg} />
      ))}
       {isLoading && messages[messages.length-1]?.role === Role.USER && (
        <MessageBubble message={{role: Role.MODEL, content: ''}} />
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};