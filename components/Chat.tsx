import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { sendMessageStream } from '../services/geminiService';
import { SendIcon, TrashIcon } from './Icons';
import { getUser } from '../services/authService';
import { WELCOME_MESSAGES } from '../constants';

const TypingIndicator = () => (
  <div className="flex items-center space-x-1 p-2">
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
  </div>
);

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = getUser();
  const storageKey = user ? `chatHistory_${user.nickname}_${user.language}` : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load history from localStorage on initial render
  useEffect(() => {
    if (!storageKey) return;
    
    const savedHistoryRaw = localStorage.getItem(storageKey);
    const userLanguage = user?.language || 'en';
    const welcomeMessage = WELCOME_MESSAGES[userLanguage] || WELCOME_MESSAGES['en'];
    
    if (savedHistoryRaw) {
      try {
        const savedHistory = JSON.parse(savedHistoryRaw);
        // Ensure history is not empty and revive date objects
        if (Array.isArray(savedHistory) && savedHistory.length > 0) {
          setMessages(savedHistory.map((msg: Message) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })));
        } else {
           // If saved history is empty, start with a welcome message
          setMessages([{ id: 'initial-bot-message', text: welcomeMessage, sender: 'bot', timestamp: new Date() }]);
        }
      } catch (error) {
        console.error("Failed to parse chat history:", error);
        // Fallback to welcome message on parse error
        setMessages([{ id: 'initial-bot-message', text: welcomeMessage, sender: 'bot', timestamp: new Date() }]);
      }
    } else {
      // No history found, start with a welcome message
      setMessages([{ id: 'initial-bot-message', text: welcomeMessage, sender: 'bot', timestamp: new Date() }]);
    }
  }, [storageKey]);

  // Save history to localStorage whenever messages change
  useEffect(() => {
    if (storageKey && messages.length > 0) {
      const historyToSave = messages.filter(msg => msg.text !== '...');
      if (historyToSave.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(historyToSave));
      }
    }
  }, [messages, storageKey]);


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear this conversation? This action cannot be undone.')) {
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }
      const userLanguage = user?.language || 'en';
      const welcomeMessage = WELCOME_MESSAGES[userLanguage] || WELCOME_MESSAGES['en'];
      setMessages([{ id: 'initial-bot-message', text: welcomeMessage, sender: 'bot', timestamp: new Date() }]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const botMessageId = `bot-${Date.now()}`;

    // Add a placeholder for the bot's message while waiting for the stream
    setMessages((prev) => [
      ...prev,
      {
        id: botMessageId,
        text: '...', // This specific text will trigger the TypingIndicator
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);

    try {
      const stream = await sendMessageStream(userMessage.text);
      let botResponse = '';
      let firstChunk = true;

      for await (const chunk of stream) {
        botResponse += chunk;
        if (firstChunk) {
          // Replace the typing indicator with the first chunk of text
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId ? { ...msg, text: botResponse } : msg
            )
          );
          firstChunk = false;
        } else {
          // Append subsequent chunks
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId ? { ...msg, text: botResponse } : msg
            )
          );
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Fix: Use the botMessageId to find and update the correct message with an error.
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? { ...msg, text: 'Sorry, something went wrong. Please try again.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <header className="p-4 border-b border-gray-700 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-semibold">LumenstaBot</h1>
        {messages.length > 1 && (
            <button 
                onClick={handleClearHistory}
                title="Clear conversation history"
                className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                aria-label="Clear conversation history"
            >
                <TrashIcon />
            </button>
        )}
      </header>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              } ${
                message.sender === 'user'
                  ? 'animate-fade-in-and-scale-up'
                  : 'animate-fade-in-and-slide-up'
              }`}
            >
              <div
                className={`max-w-xl lg:max-w-2xl p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-teal-600 text-white rounded-br-none'
                    : 'bg-gray-700 text-gray-200 rounded-bl-none'
                }`}
              >
                {message.sender === 'bot' && message.text === '...' ? (
                  <TypingIndicator />
                ) : (
                  <div>
                    <p className="pb-1" style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
                    <div className={`text-right text-xs mt-1 ${
                        message.sender === 'user' ? 'text-gray-200 opacity-75' : 'text-gray-400'
                    }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex gap-4 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            className="p-3 bg-teal-600 rounded-lg hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center w-12"
            disabled={isLoading || !input.trim()}
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;