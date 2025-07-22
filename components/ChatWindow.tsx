
import React, { useEffect, useRef } from 'react';
import type { Message } from '../types.ts';
import { Role } from '../types.ts';
import { MessageBubble } from './MessageBubble.tsx';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  isDemoMode: boolean;
}

const DemoModeBanner: React.FC = () => (
  <div className="rounded-lg bg-yellow-100/80 dark:bg-yellow-900/50 p-4 border border-yellow-400/50 backdrop-blur-sm sticky top-0 z-10 mx-4">
    <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">Demo Mode Active</h3>
    <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
      The AI is currently running in offline demo mode. Responses are simulated.
    </p>
    <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-200/80">
      To connect to the live AI, create a <strong>config.js</strong> file in the root directory with your API key:
      <code className="block bg-yellow-200/50 dark:bg-yellow-800/50 p-1 rounded mt-1 font-mono">
        window.CONFIG = {'{'} API_KEY: 'YOUR_API_KEY' {'}'};
      </code>
    </p>
  </div>
);


export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, isDemoMode }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {isDemoMode && <DemoModeBanner />}
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
