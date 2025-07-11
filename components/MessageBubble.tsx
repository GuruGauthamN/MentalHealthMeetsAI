
import React from 'react';
import type { Message } from '../types';
import { Role } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';

interface MessageBubbleProps {
  message: Message;
}

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center justify-center space-x-1">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
    </div>
);


export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const isModel = message.role === Role.MODEL;

  const bubbleClasses = isUser
    ? 'bg-teal-500 text-white'
    : 'bg-white/70 dark:bg-gray-900/60 backdrop-blur-lg text-gray-800 dark:text-gray-100 shadow-sm';
  
  const containerClasses = isUser ? 'justify-end' : 'justify-start';
  const Icon = isUser ? UserIcon : BotIcon;
  const iconClasses = isUser ? 'order-2 ml-2' : 'order-1 mr-2';

  return (
    <div className={`flex items-end space-x-2 ${containerClasses}`}>
      {isModel && <div className={iconClasses}><Icon className="w-8 h-8 p-1.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"/></div>}
      <div className={`max-w-xl lg:max-w-2xl px-4 py-3 rounded-2xl ${bubbleClasses} ${isUser ? 'rounded-br-lg' : 'rounded-bl-lg'}`}>
        {isModel && message.content === '' ? (
            <LoadingIndicator />
        ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
      {isUser && <div className={iconClasses}><Icon className="w-8 h-8 p-1.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"/></div>}
    </div>
  );
};
