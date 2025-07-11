
export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Message {
  role: Role;
  content: string;
}

export interface ChatTag {
  id: string;
  label: string;
  description: string;
  promptValue: string;
}

export interface Helpline {
  name: string;
  phone: string;
  website: string;
}

export interface GoogleUserProfile {
  name: string;
  email: string;
  imageUrl: string;
}
