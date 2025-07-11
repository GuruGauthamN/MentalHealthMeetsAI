
import React from 'react';
import type { Helpline } from '../types';
import { HELPLINE_INFO } from '../constants';
import { XIcon } from './icons/XIcon';

interface HelplineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelplineModal: React.FC<HelplineModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">It's Okay to Ask for Help</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          It sounds like you are going through a difficult time. Please know that there are people who want to support you.
          Connecting with someone can make a difference. Here are some resources available 24/7.
        </p>
        <div className="mt-6 space-y-4">
          {HELPLINE_INFO.map((helpline: Helpline) => (
            <div key={helpline.name} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-800 dark:text-white">{helpline.name}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Phone:</span> {helpline.phone}
              </p>
              <a
                href={helpline.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-500 dark:text-teal-400 hover:underline"
              >
                Visit Website
              </a>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
