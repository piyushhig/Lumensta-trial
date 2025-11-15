import React, { useState } from 'react';
import { User } from '../types';
import { NICKNAME_PROMPT } from '../constants';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [nickname, setNickname] = useState('');
  const [language, setLanguage] = useState('en');
  const [isExiting, setIsExiting] = useState(false);
  const [showNicknameError, setShowNicknameError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setShowNicknameError(true);
      return;
    }

    if (!isExiting) {
      setIsExiting(true);
      setTimeout(() => {
        onLogin({ nickname: nickname.trim(), language });
      }, 500); // Wait for animation to finish
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-800 text-white">
      {showNicknameError && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in-and-scale-up">
          <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-sm text-center">
            <h2 className="text-2xl font-bold mb-4">Lumensta</h2>
            <p className="text-lg text-gray-300 mb-6">{NICKNAME_PROMPT[language] || NICKNAME_PROMPT['en']}</p>
            <button
              onClick={() => setShowNicknameError(false)}
              className="px-6 py-2 bg-teal-600 rounded-lg font-semibold hover:bg-teal-700 transition-colors w-full"
              autoFocus
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className={`w-full max-w-sm p-8 bg-gray-900 rounded-lg shadow-lg text-center ${isExiting ? 'animate-fade-out-and-scale-down' : ''}`}>
        <h1 className="text-3xl font-bold mb-2 animate-fade-in-and-slide-up-slow">Lumensta</h1>
        <p className="text-gray-400 mb-8 animate-fade-in-and-slide-up-slow animation-delay-200">Where silence ends, healing begins.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 animate-fade-in-and-slide-up-slow animation-delay-400">
            <label htmlFor="language" className="block text-left mb-2 text-gray-300">
              Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={isExiting}
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="ur">اردو (Urdu)</option>
            </select>
          </div>

          <div className="mt-4 animate-fade-in-and-slide-up-slow animation-delay-600">
            <label htmlFor="nickname" className="block text-left mb-2 text-gray-300">
              Choose a nickname to get started
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Your nickname"
              autoFocus
              disabled={isExiting}
            />
          </div>

          <button
            type="submit"
            className="w-full mt-6 p-3 bg-teal-600 rounded-lg font-semibold hover:bg-teal-700 transition-all duration-100 ease-in-out active:scale-[0.98] animate-fade-in-and-slide-up-slow animation-delay-800 disabled:opacity-50 disabled:cursor-wait"
            disabled={isExiting}
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;