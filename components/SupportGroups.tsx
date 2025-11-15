import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { SupportGroup, SubGroup, GroupMessage } from '../types';
import { ChevronLeftIcon, FamilyIcon, PawIcon, HeartbreakIcon, SendIcon } from './Icons';
import { getUser } from '../services/authService';

// Mock Data for demonstration
const mockGroups: SupportGroup[] = [
  {
    id: 'loss-loved-one',
    name: 'Loss of a Loved One',
    icon: FamilyIcon,
    description: "For those navigating the journey of losing a family member or dear friend.",
    subGroups: [
      {
        id: 'loss-parent',
        name: 'Loss of a Parent',
        description: 'A space to share memories and navigate the unique journey of losing a parent.',
        messages: [
          { id: '1', author: 'Alex', avatarSeed: 'Alex', text: "Hey everyone. It's my first time here. My dad passed away last month and everything just feels... empty.", timestamp: new Date(Date.now() - 300000).toISOString() },
          { id: '2', author: 'Beacon', avatarSeed: 'Beacon', text: "Welcome, Alex. We're so glad you found your way here. That feeling of emptiness is something many of us understand. **You're not alone in this.**", isAI: true, timestamp: new Date(Date.now() - 240000).toISOString() },
          { id: '3', author: 'Samira', avatarSeed: 'Samira', text: "I get that, Alex. For me, it was the silence. My mom was always humming or had the radio on.", timestamp: new Date(Date.now() - 180000).toISOString() },
        ]
      },
      {
        id: 'loss-partner',
        name: 'Loss of a Partner',
        description: 'Find support from others who understand the profound loss of a partner or spouse.',
        messages: [{ id: '1', author: 'Solace', avatarSeed: 'Solace', text: 'Welcome to the Loss of a Partner support group. This is a safe space to share.', isAI: true, timestamp: new Date().toISOString() }]
      }
    ]
  },
  {
    id: 'pet-bereavement',
    name: 'Pet Bereavement',
    icon: PawIcon,
    description: "A safe space to honor the paw prints left on our hearts by our beloved animal companions.",
    subGroups: [
        {
            id: 'loss-pet',
            name: 'The Paw Print on Our Hearts',
            description: 'For those grieving the loss of a beloved animal companion.',
            messages: [
                { id: '1', author: 'Sunny', avatarSeed: 'Sunny', text: 'I feel silly saying it, but losing my dog feels harder than some people I\'ve lost.', timestamp: new Date(Date.now() - 120000).toISOString() },
                { id: '2', author: 'Paws', avatarSeed: 'Paws', text: "There is *nothing* silly about that feeling, Sunny. The bond we share with our pets is one of unconditional love and constant companionship. The grief is just as real and valid.", isAI: true, timestamp: new Date(Date.now() - 60000).toISOString() },
            ]
        }
    ]
  },
  {
      id: 'relationship-loss',
      name: 'Relationship Loss',
      icon: HeartbreakIcon,
      description: "Support for those navigating the difficult emotions of a breakup, separation, or divorce.",
      subGroups: [
          {
              id: 'navigating-breakups',
              name: 'Navigating Breakups',
              description: 'A place to process, heal, and rediscover yourself after a relationship ends.',
              messages: [
                  { id: '1', author: 'Taylor', avatarSeed: 'Taylor', text: 'It ended a week ago and I can\'t stop replaying everything. Wondering what I did wrong.', timestamp: new Date(Date.now() - 90000).toISOString() },
                  { id: '2', author: 'Compass', avatarSeed: 'Compass', text: "That's a very common reaction, Taylor. It's natural to search for reasons. Be gentle with yourself right now; *healing isn't about placing blame.*", isAI: true, timestamp: new Date(Date.now() - 30000).toISOString() },
              ]
          }
      ]
  }
];

const AIFacilitatorIcon = () => (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0 mb-auto" title="AI Facilitator">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    </div>
);

const SupportGroups: React.FC = () => {
    const [groupsData, setGroupsData] = useState<SupportGroup[]>(mockGroups);
    const [activeGroup, setActiveGroup] = useState<SupportGroup | null>(null);
    const [activeSubGroup, setActiveSubGroup] = useState<SubGroup | null>(null);
    const [input, setInput] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);
    const user = getUser();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [groupsData, activeSubGroup]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !user || !activeGroup || !activeSubGroup) return;

        const userMessage: GroupMessage = {
            id: Date.now().toString(),
            author: user.nickname,
            avatarSeed: user.nickname,
            text: input.trim(),
            timestamp: new Date().toISOString(),
            isUser: true,
        };

        setInput('');

        setGroupsData(prevGroups => prevGroups.map(group => {
            if (group.id !== activeGroup.id) return group;
            return {
                ...group,
                subGroups: group.subGroups.map(sub => {
                    if (sub.id !== activeSubGroup.id) return sub;
                    return { ...sub, messages: [...sub.messages, userMessage] };
                })
            };
        }));
        
        // Simulate "seen by" count
        setTimeout(() => {
            const seenCount = Math.floor(Math.random() * 5) + 2; // 2 to 6 people
            setGroupsData(prevGroups => prevGroups.map(group => {
                if (group.id !== activeGroup.id) return group;
                return { ...group,
                    subGroups: group.subGroups.map(sub => {
                        if (sub.id !== activeSubGroup.id) return sub;
                        return { ...sub,
                            messages: sub.messages.map(msg => 
                                msg.id === userMessage.id ? { ...msg, seenCount } : msg
                            )
                        };
                    })
                };
            }));
        }, 1500 + Math.random() * 1000);

        // Simulate bot reply
        setIsBotTyping(true);
        setTimeout(() => {
            setIsBotTyping(false);
            const botMessage: GroupMessage = {
                id: `bot-${Date.now()}`,
                author: 'Beacon',
                avatarSeed: 'Beacon',
                text: `Thank you for sharing your feelings, **${user.nickname}**. It takes courage to be open, and your voice is *valued here*.`,
                timestamp: new Date().toISOString(),
                isAI: true,
            };
            setGroupsData(prevGroups => prevGroups.map(group => {
                if (group.id !== activeGroup.id) return group;
                return { ...group,
                    subGroups: group.subGroups.map(sub => {
                        if (sub.id !== activeSubGroup.id) return sub;
                        return { ...sub, messages: [...sub.messages, botMessage] };
                    })
                };
            }));
        }, 2000 + Math.random() * 1500);
    };

    if (activeSubGroup && activeGroup) {
        const currentSubGroup = groupsData
            .find(g => g.id === activeGroup.id)
            ?.subGroups.find(sg => sg.id === activeSubGroup.id);
        
        if (!currentSubGroup) return null;

        return (
            <div className="flex flex-col h-full bg-gray-800 text-white">
                <header className="p-4 border-b border-gray-700 shadow-md flex items-center">
                    <button onClick={() => setActiveSubGroup(null)} className="mr-4 p-2 rounded-full hover:bg-gray-700">
                        <ChevronLeftIcon />
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold">{activeSubGroup.name}</h1>
                        <p className="text-sm text-gray-400">{activeGroup.name}</p>
                    </div>
                </header>
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-6 max-w-4xl mx-auto">
                        {currentSubGroup.messages.map((message) => (
                             <div key={message.id} className={`flex items-end gap-3 animate-fade-in-and-slide-up ${
                                message.isUser ? 'justify-end' : 'justify-start'
                             }`}>
                                {!message.isUser && (
                                    message.isAI
                                        ? <AIFacilitatorIcon />
                                        : <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${message.avatarSeed || message.author}`} alt={message.author} className="w-8 h-8 rounded-full mb-auto flex-shrink-0" />
                                )}
                                <div className={`flex flex-col max-w-xl p-3 rounded-lg ${
                                    message.isUser ? 'bg-teal-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'
                                }`}>
                                    {!message.isUser && (
                                        <p className="font-semibold text-sm mb-1 text-teal-400">
                                            {message.author} {message.isAI && '• AI Facilitator'}
                                        </p>
                                    )}
                                    {message.isAI ? (
                                        <div className="prose prose-sm prose-invert max-w-none">
                                            <ReactMarkdown>{message.text}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
                                    )}
                                    <div className="text-xs text-right mt-2 flex items-center justify-end gap-2">
                                        <span className={message.isUser ? 'text-teal-200 opacity-80' : 'text-gray-400'}>
                                            {new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                        </span>
                                        {message.isUser && message.seenCount && (
                                            <span className="flex items-center gap-1 text-teal-200 opacity-80">
                                                • Seen by {message.seenCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {message.isUser && user && (
                                     <img src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.nickname}`} alt={message.author} className="w-8 h-8 rounded-full mb-auto flex-shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>
                     <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-gray-700 bg-gray-800">
                    {isBotTyping && (
                        <div className="text-sm text-gray-400 italic mb-2 max-w-4xl mx-auto px-1">
                           A facilitator is typing...
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className="flex gap-4 max-w-4xl mx-auto">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            disabled={isBotTyping}
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="p-3 bg-teal-600 rounded-lg hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center w-12"
                            disabled={!input.trim() || isBotTyping}
                        >
                            <SendIcon />
                        </button>
                    </form>
                </div>
            </div>
        );
    }
    
    if (activeGroup) {
        return (
             <div className="flex flex-col h-full bg-gray-800 text-white">
                <header className="p-4 border-b border-gray-700 shadow-md flex items-center">
                    <button onClick={() => setActiveGroup(null)} className="mr-4 p-2 rounded-full hover:bg-gray-700">
                        <ChevronLeftIcon />
                    </button>
                    <h1 className="text-xl font-semibold">{activeGroup.name}</h1>
                </header>
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-4">
                        <p className="text-gray-300 mb-2">Select a group to see the conversation.</p>
                        {activeGroup.subGroups.map(subGroup => (
                            <button key={subGroup.id} onClick={() => setActiveSubGroup(subGroup)} className="w-full text-left p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                                <h3 className="text-lg font-bold">{subGroup.name}</h3>
                                <p className="text-gray-300">{subGroup.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white">
      <header className="p-4 border-b border-gray-700 shadow-md">
        <h1 className="text-xl font-semibold">Support Groups</h1>
      </header>
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
            <p className="text-gray-300 mb-8 text-center">Connect with others who understand. These groups are safe spaces for sharing and listening. Select a category to begin.</p>
            <div className="flex flex-col md:flex-row gap-6">
                {mockGroups.map(group => {
                    const Icon = group.icon;
                    return (
                        <button 
                            key={group.id} 
                            onClick={() => setActiveGroup(group)} 
                            className="group flex-1 text-left p-6 bg-gray-700 rounded-lg hover:bg-gray-600/70 hover:-translate-y-1 transition-all duration-300 border border-gray-600/50"
                        >
                            <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-3 rounded-lg w-12 h-12 mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Icon className="w-full h-full text-white" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">{group.name}</h2>
                            <p className="text-gray-300">{group.description}</p>
                        </button>
                    )
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SupportGroups;