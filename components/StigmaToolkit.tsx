import React, { useState } from 'react';

const stigmaData = [
  {
    myth: 'Being strong means not showing your emotions.',
    truth: 'True strength is acknowledging and processing your feelings, not suppressing them. Crying is a natural and healthy part of healing.',
  },
  {
    myth: 'Grief follows a predictable, linear pattern of stages.',
    truth: 'Grief is a unique and often messy journey. It comes in waves, and there is no "right" way or timeline to heal. The "stages" are a guideline, not a rule.',
  },
  {
    myth: 'Once you get over a loss, you should move on and not look back.',
    truth: "Healing doesn't mean forgetting. We learn to live with loss and integrate the memory of what we've lost into our lives in a new way.",
  },
  {
    myth: 'Men don’t grieve in the same way or as deeply as women.',
    truth: 'Grief has no gender. Societal expectations may influence how people express their grief, but the internal experience of loss is a universal human one.',
  },
  {
    myth: 'You should try to distract yourself and stay busy to avoid the pain.',
    truth: 'While healthy distractions can provide temporary relief, avoiding the pain of grief can prolong the healing process. It is important to allow yourself to feel it.',
  },
];

const TruthvsMyth: React.FC = () => {
  const [flippedCard, setFlippedCard] = useState<number | null>(null);

  const handleFlip = (index: number) => {
    setFlippedCard(flippedCard === index ? null : index);
  };

  const LightbulbIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
  );

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white">
      <header className="p-4 border-b border-gray-700 shadow-md">
        <h1 className="text-xl font-semibold">Truth vs. Myth</h1>
      </header>
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-300 mb-8 text-center">
            Understanding grief is the first step toward healing. Let's challenge some common misconceptions together. Click a card to reveal the truth.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 [perspective:1000px]">
            {stigmaData.map((item, index) => (
              <div
                key={index}
                className="w-full h-64 cursor-pointer group"
                onClick={() => handleFlip(index)}
              >
                <div
                  className={`relative w-full h-full rounded-lg shadow-lg transition-all duration-500 [transform-style:preserve-3d] ${
                    flippedCard === index ? '[transform:rotateY(180deg)]' : ''
                  }`}
                >
                  {/* Front of the card */}
                  <div className="absolute inset-0 bg-gray-700 rounded-lg p-6 flex flex-col justify-between items-center [backface-visibility:hidden]">
                    <h2 className="text-lg font-semibold text-center">{item.myth}</h2>
                    <span className="text-sm font-medium text-indigo-400 group-hover:text-indigo-300">
                      Click to Reveal Truth
                    </span>
                  </div>
                  
                  {/* Back of the card */}
                  <div className="absolute inset-0 bg-indigo-800 rounded-lg p-6 flex flex-col justify-center items-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                     <h3 className="text-lg font-bold text-indigo-200 mb-4 flex items-center">
                        <LightbulbIcon />
                        Truth
                     </h3>
                    <p className="text-center text-indigo-100">{item.truth}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TruthvsMyth;