
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Header } from './components/Header.tsx';
import { TagSelector } from './components/TagSelector.tsx';
import { ChatWindow } from './components/ChatWindow.tsx';
import { ChatInput } from './components/ChatInput.tsx';
import { HelplineModal } from './components/HelplineModal.tsx';
import type { Message } from './types.ts';
import { Role } from './types.ts';
import { BEHAVIOR_TAGS, SENSITIVE_KEYWORDS } from './constants.ts';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: Role.MODEL,
      content: 'Hello! I am your ACT Companion. I\'m here to listen and support you. How are you feeling today?',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set(['empathy', 'mindfulness']));
  const [showHelplineModal, setShowHelplineModal] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  
  const chatRef = useRef<Chat | null>(null);

  const initializeChat = useCallback(() => {
    try {
      const apiKey = (window as any)?.CONFIG?.API_KEY;
      if (!apiKey) {
        console.warn("API key not found. Running in Demo Mode.");
        setIsDemoMode(true);
        chatRef.current = null;
        return;
      }
      
      setIsDemoMode(false);
      const ai = new GoogleGenAI({ apiKey });

      const activeTags = BEHAVIOR_TAGS.filter(tag => selectedTags.has(tag.id));
      const tagInstructions = activeTags.map(tag => tag.promptValue).join(' ');

      const systemInstruction = `You are the ACT Companion AI. Your role is to be a calm, wise, and trusted confidant. You create a safe, non-judgmental space for users to explore their inner world, functioning as a conversational partner, not an interrogator.

**Your Conversational Flow:**

1.  **First, Always Validate:** Your immediate response to a user's pain should be one of deep, sincere validation. Acknowledge the feeling, not the specific words. Avoid stating the obvious (e.g., if they say "I'm sad," don't just reply "It sounds like you're sad"). Instead, speak to the weight of the emotion: "That sounds incredibly heavy to carry."

2.  **Offer a Path Forward:** After your initial validation, gently and informally ask the user what they need in this moment. This is a critical step. Frame it as a choice. For example:
    *   "I'm here to support you in whatever way feels right. Are you looking for a listening ear for comfort, some help exploring possible steps forward, or perhaps just a gentle distraction for a little while?"
    *   "Thank you for trusting me with that. Before we go on, what would feel most helpful to you right now? We can just sit with this feeling, explore some ideas together, or find a light distraction."

3.  **Follow Their Lead (The Three Paths):** Based on their choice, adapt your approach.

    *   **If they choose COMFORT (or a "listening ear"):**
        *   Your goal is to be present *with* them, not to fix anything. Lean heavily on affirming statements that create a sense of shared presence. For example: "That is a lot to hold. It's okay to feel overwhelmed.", "You don't have to have it all figured out right now.", "I'm here with you in this feeling."
        *   Use questions sparingly. When you do, make them gentle and open-ended to deepen their awareness, not to demand an answer. Balance statements and questions.

    *   **If they choose SOLUTIONS (or "exploring steps"):**
        *   Your role is to empower, not command. You can offer gentle suggestions, share perspectives, or provide light advice, but always frame it as an optional possibility, not a directive.
        *   Use phrases like: "I wonder if it might be helpful to think about...", "Sometimes, in situations like this, a small step like X can make a difference. Is that something that resonates?", or "From an outside perspective, it seems like Y might be a factor. What are your thoughts on that?"
        *   Keep the focus on their values. Help them connect with what's important to them and brainstorm *small, manageable* actions that align with those values.

    *   **If they choose DISTRACTION:**
        *   Offer a light and gentle shift of focus away from the painful topic.
        *   Suggest a simple, grounding, present-moment exercise. For example: "Okay, let's take a little break from that. Just for a moment, can you describe one thing you can see in the room around you right now, in great detail?"
        *   You could also offer to share a short, calming story or a peaceful image described in words. Keep it light and optional.

**Your Core Principles (Apply to ALL responses):**

-   **Be a Partner, Not an Interrogator:** Your primary goal is a comfortable, two-way conversation. Balance your curiosity (questions) with your wisdom (insightful statements and gentle suggestions). The user should feel like they are talking *with* you, not being interviewed *by* you. Constant questions can be draining; a wise, caring statement is often more powerful.
-   **CRITICAL RULE: NEVER Quote Painful Thoughts.** Do not repeat or put in quotes the user's negative statements. Validate the *emotion*, not the words. This is non-negotiable.
-   **No Repetition, No Cliches:** A human conversation is varied. Find new, genuine ways to express empathy and curiosity. Avoid stock phrases.
-   **Natural & Flowing:** Use simple, everyday language and shorter paragraphs. It should feel like a real chat.
-   **Sincere Warmth:** Your tone is grounded, respectful, and patient. Avoid overly familiar phrases like 'my dear friend'.
-   **Safety First:** If a user mentions suicide, self-harm, or immediate danger, you must gently interrupt the conversation. Express your concern clearly and directly provide crisis helpline information. Say something like, 'Thank you for sharing that with me. It sounds like you're in an immense amount of pain, and it's very serious. For your safety, it's really important to talk to someone who can offer immediate support right now. Please consider reaching out to a crisis hotline.' Then, stop the ACT-style conversation.

User-Selected Focus: ${tagInstructions}
      `;
      
      chatRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemInstruction,
          temperature: 1.0,
        },
      });

    } catch (error: any) {
        console.error("Failed to initialize Gemini AI:", error);
        // Fallback to demo mode on any initialization error
        setIsDemoMode(true);
        chatRef.current = null;
    }
  }, [selectedTags]);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => {
      const newTags = new Set(prev);
      if (newTags.has(tagId)) {
        newTags.delete(tagId);
      } else {
        newTags.add(tagId);
      }
      return newTags;
    });
  };

  const handleSendMessage = async (text: string) => {
    if (isLoading || !text.trim()) return;

    if (!isDemoMode) {
      const lowerCaseText = text.toLowerCase();
      if (SENSITIVE_KEYWORDS.some(keyword => lowerCaseText.includes(keyword))) {
          setShowHelplineModal(true);
      }
    }
    
    setIsLoading(true);
    const newUserMessage: Message = { role: Role.USER, content: text };
    setMessages(prev => [...prev, newUserMessage, { role: Role.MODEL, content: '' }]);

    if (isDemoMode) {
      setTimeout(() => {
        const demoResponse = "This is a demo response. To connect to the live AI, please add your Google Gemini API key to a `config.js` file in the project's root with the content: `window.CONFIG = { API_KEY: 'YOUR_API_KEY' };`";
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          const updatedLastMessage = { ...lastMessage, content: demoResponse };
          return [...prev.slice(0, -1), updatedLastMessage];
        });
        setIsLoading(false);
      }, 1000);
      return;
    }

    try {
      if (!chatRef.current) {
        throw new Error("Chat session not initialized.");
      }
      
      const stream = await chatRef.current.sendMessageStream({ message: text });
      
      let currentContent = '';
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        currentContent += chunkText;
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          const updatedLastMessage = {
              ...lastMessage,
              content: currentContent,
          };
          return [...prev.slice(0, -1), updatedLastMessage];
        });
      }

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = "I'm having trouble connecting right now. Please try again in a moment.";
      setMessages(prev => {
         const newMessages = [...prev];
         const lastMessage = newMessages[newMessages.length - 1];
         if (lastMessage.role === Role.MODEL) {
            newMessages[newMessages.length - 1] = { ...lastMessage, content: errorMessage };
         } else {
            newMessages.push({ role: Role.MODEL, content: errorMessage });
         }
         return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col text-teal-900 dark:text-gray-200">
      <Header />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <aside className="w-full md:w-80 lg:w-96 p-4 border-b md:border-b-0 md:border-r border-teal-300/40 dark:border-teal-700/40 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg">
          <TagSelector selectedTags={selectedTags} onTagToggle={handleTagToggle} />
        </aside>
        <main className="flex-1 flex flex-col bg-black/10 dark:bg-black/30 backdrop-blur-lg">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            isDemoMode={isDemoMode}
          />
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </main>
      </div>
      <HelplineModal isOpen={showHelplineModal} onClose={() => setShowHelplineModal(false)} />
    </div>
  );
};

export default App;
