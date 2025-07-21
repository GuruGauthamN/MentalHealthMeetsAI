
import React, { useState } from 'react';
import { SendIcon } from './icons/SendIcon.tsx';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  return (
    <div className="mt-auto p-4 bg-white/40 dark:bg-gray-900/50 backdrop-blur-lg border-t border-teal-300/40 dark:border-teal-700/40">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1 w-full px-4 py-2 bg-white/80 dark:bg-gray-800/50 text-gray-800 dark:text-gray-100 placeholder-teal-600/90 dark:placeholder-teal-400/70 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="flex-shrink-0 p-3 bg-teal-500 text-white rounded-full hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 disabled:bg-teal-500/60 dark:disabled:bg-teal-800 disabled:cursor-not-allowed transition-colors"
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};