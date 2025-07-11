
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="p-4 border-b border-teal-300/40 dark:border-teal-700/40 bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg shadow-sm flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 dark:text-teal-100">
          ACT Companion AI
        </h1>
        <p className="text-sm text-teal-700 dark:text-teal-200">
          Your mindful space for reflection and acceptance.
        </p>
      </div>
    </header>
  );
};