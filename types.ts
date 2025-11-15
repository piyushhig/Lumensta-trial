import type React from 'react';

export interface User {
  nickname: string;
  language: string;
  avatar?: string; // Optional avatar URL or base64 data
  bio?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// For Support Groups
export interface GroupMessage {
  id:string;
  author: string; // Nickname of the member
  avatarSeed?: string;
  text: string;
  timestamp: string;
  isAI?: boolean;
  isUser?: boolean; // To identify messages from the current user
  seenCount?: number;
}

export interface SubGroup {
  id: string;
  name: string;
  description: string;
  messages: GroupMessage[];
}

// FIX: Added `icon` and `description` to the SupportGroup interface to match the data structure used in `SupportGroups.tsx`.
export interface SupportGroup {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  subGroups: SubGroup[];
}