import type { ChatTag, Helpline } from './types';

// IMPORTANT: Replace with your actual Google Cloud Client ID. The user authenticating will need edit access to the doc below.
export const GOOGLE_CLIENT_ID = 'AIzaSyAzGrDB6XZ4efvVFPOecNBM-kUByunv4kY';
export const GOOGLE_DOC_ID = '1D-Yfj-ND5W2nIyY_zock-YQCBw3by_ir9Ue9XKZDA5w';

// Note: The Google Gemini API Key is now sourced from the `process.env.API_KEY` environment variable.

export const BEHAVIOR_TAGS: ChatTag[] = [
  {
    id: 'empathy',
    label: 'Empathetic',
    description: 'Listens with understanding and compassion.',
    promptValue: 'Prioritize expressing deep empathy and validating the user\'s feelings. Make them feel heard and understood.',
  },
  {
    id: 'mindfulness',
    label: 'Mindful',
    description: 'Guides towards present-moment awareness.',
    promptValue: 'Gently guide the user towards mindfulness and being present with their thoughts and feelings without judgment.',
  },
  {
    id: 'emotion_regulation',
    label: 'Emotion Regulating',
    description: 'Helps in managing difficult emotions.',
    promptValue: 'Focus on helping the user navigate their emotions using techniques of defusion (seeing thoughts as thoughts) and acceptance (allowing feelings to be).',
  },
  {
    id: 'values_clarification',
    label: 'Values-driven',
    description: 'Focuses on what truly matters to the user.',
    promptValue: 'Help the user connect with their core values and explore small, committed actions that align with what truly matters to them.',
  },
];

export const HELPLINE_INFO: Helpline[] = [
    {
        name: 'National Suicide Prevention Lifeline',
        phone: '988',
        website: 'https://988lifeline.org/'
    },
    {
        name: 'Crisis Text Line',
        phone: 'Text HOME to 741741',
        website: 'https://www.crisistextline.org/'
    },
    {
        name: 'The Trevor Project (for LGBTQ youth)',
        phone: '1-866-488-7386',
        website: 'https://www.thetrevorproject.org/'
    }
];

export const SENSITIVE_KEYWORDS: string[] = [
  'suicide', 'kill myself', 'self-harm', 'want to die', 'end my life', 'ending my life',
  'hopeless', 'no reason to live', 'self harm', 'hurting myself', 'violence', 'beat me'
];