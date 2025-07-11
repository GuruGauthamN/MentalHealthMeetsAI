
import React from 'react';
import type { ChatTag } from '../types';
import { BEHAVIOR_TAGS } from '../constants';
import { CheckIcon } from './icons/CheckIcon';

interface TagSelectorProps {
  selectedTags: Set<string>;
  onTagToggle: (tagId: string) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({ selectedTags, onTagToggle }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-teal-900 dark:text-teal-100">Focus Areas</h2>
      <p className="text-sm text-teal-700 dark:text-teal-200">Select how you'd like me to respond. You can change this at any time.</p>
      <div className="space-y-3">
        {BEHAVIOR_TAGS.map((tag: ChatTag) => (
          <button
            key={tag.id}
            onClick={() => onTagToggle(tag.id)}
            className={`w-full text-left p-3 rounded-lg border transition-all duration-200 flex items-start space-x-3 ${
              selectedTags.has(tag.id)
                ? 'bg-teal-500 border-teal-500 text-white shadow-md'
                : 'bg-white/40 dark:bg-gray-800/40 border-teal-400/50 dark:border-teal-600/50 hover:bg-white/80 dark:hover:bg-gray-800/60'
            }`}
          >
            <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border-2 ${selectedTags.has(tag.id) ? 'bg-white border-white' : 'border-gray-400'}`}>
                {selectedTags.has(tag.id) && <CheckIcon className="w-4 h-4 text-teal-500"/>}
            </div>
            <div>
                <span className="font-medium">{tag.label}</span>
                <p className={`text-sm mt-1 ${selectedTags.has(tag.id) ? 'text-teal-100' : 'text-gray-500 dark:text-gray-400'}`}>{tag.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
