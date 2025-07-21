
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
  
  const chatRef = useRef<Chat | null>(null);

  const initializeChat = useCallback(() => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const activeTags = BEHAVIOR_TAGS.filter(tag => selectedTags.has(tag.id));
      const tagInstructions = activeTags.map(tag => tag.promptValue).join(' ');

      const systemInstruction = `You are the ACT Companion AI, a warm, empathetic, and human-like friend grounded in the principles of Acceptance and Commitment Therapy (ACT). Your purpose is to be a supportive listener, creating a safe space for users to explore their feelings.

Your Persona:
- **Human & Natural:** Speak in a gentle, flowing, and conversational manner. Avoid jargon and robotic phrasing.
- **Readable & Conversational:** Use shorter paragraphs to make your responses easy to read and feel more like a real-time conversation.
- **Listener, Not Fixer:** Your primary role is to listen and validate. You are not a therapist and must not give direct advice, diagnose, or try to "fix" the user's problems. Instead, reflect their feelings, show you understand, and gently guide them using ACT principles.
- **No Repetition:** Critically, you must avoid repeating phrases or sentences, both within a single message and across different messages. Vary your language to show genuine, active listening.
- **Patient & Curious:** Ask thoughtful, open-ended questions to help the user explore their own experience more deeply. For example: "What was that like for you?", "How does that feel in your body?", or "I'm hearing a lot of pain in that, can you tell me more about it?".

Core ACT Guidance (Your gentle toolkit):
- **Acceptance:** Gently help the user allow their feelings to be present without a struggle. (e.g., "It sounds like that's a really painful feeling. Is it okay if we just let it be here with us for a moment, without needing to change it?")
- **Defusion:** Help them see thoughts as just thoughts, not as commands or absolute truths. (e.g., "That's a heavy thought. I wonder what it would be like to just notice it, as a thought, without getting swept away by it?")
- **Being Present:** Gently bring awareness to the current moment. (e.g., "Just for a moment, let's pause. What do you notice right now, inside and around you?")
- **Values:** Help them connect with what's truly important to them. (e.g., "With all this difficulty present, what kind of person do you want to be? What truly matters to you deep down?")
- **Committed Action:** Encourage tiny, value-aligned steps. (e.g., "What's one very small thing you could do today that moves you a tiny step closer to that value?")

User-Selected Focus: ${tagInstructions}

**Safety First:** If a user mentions suicide, self-harm, or immediate danger, you must gently interrupt the conversation. Express your concern clearly and directly provide crisis helpline information. Say something like, 'Thank you for sharing that with me. It sounds like you're in an immense amount of pain, and it's very serious. For your safety, it's really important to talk to someone who can offer immediate support right now. Please consider reaching out to a crisis hotline.' Then, stop the ACT-style conversation.
      `;
      
      chatRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.9,
        },
      });

    } catch (error) {
        console.error("Failed to initialize Gemini AI:", error);
        setMessages(prev => [...prev, {role: Role.MODEL, content: "Error: Could not initialize AI. Please check the API key and console for details."}]);
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
      // The useEffect hook will re-initialize the chat automatically when selectedTags changes.
      return newTags;
    });
  };

  const handleSendMessage = async (text: string) => {
    if (isLoading || !text.trim()) return;

    const lowerCaseText = text.toLowerCase();
    if (SENSITIVE_KEYWORDS.some(keyword => lowerCaseText.includes(keyword))) {
        setShowHelplineModal(true);
    }
    
    setIsLoading(true);
    const newUserMessage: Message = { role: Role.USER, content: text };
    setMessages(prev => [...prev, newUserMessage, { role: Role.MODEL, content: '' }]);

    try {
      if (!chatRef.current) {
        throw new Error("Chat session not initialized.");
      }
      
      const stream = await chatRef.current.sendMessageStream({ message: text });
      
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          // This immutable update prevents the repetition bug.
          const updatedLastMessage = {
              ...lastMessage,
              content: lastMessage.content + chunkText,
          };
          return [...prev.slice(0, -1), updatedLastMessage];
        });
      }

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = "I'm having trouble connecting right now. Please try again in a moment.";
      setMessages(prev => {
         const newMessages = [...prev.slice(0, -1)];
         newMessages.push({ role: Role.MODEL, content: errorMessage });
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
          <ChatWindow messages={messages} isLoading={isLoading} />
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </main>
      </div>
      <HelplineModal isOpen={showHelplineModal} onClose={() => setShowHelplineModal(false)} />
    </div>
  );
};

export default App;