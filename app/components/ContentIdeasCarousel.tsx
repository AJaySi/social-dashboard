'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ContentIdea {
  title: string;
  description: string;
  metrics?: {
    potential_traffic?: number;
    difficulty?: string;
    relevance_score?: number;
  };
  recommendations: string[];
}

interface ContentIdeasCarouselProps {
  ideas: ContentIdea[];
}

export default function ContentIdeasCarousel({ ideas }: ContentIdeasCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === ideas.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? ideas.length - 1 : prevIndex - 1
    );
  };

  if (!ideas.length) {
    return null;
  }

  return (
    <div className="relative w-full bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">Your Next Content Ideas</h2>
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {ideas.map((idea, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0 p-4"
            >
              <div className="bg-gray-50 rounded-lg p-6 h-full">
                <h3 className="text-xl font-semibold mb-3">{idea.title}</h3>
                <p className="text-gray-600 mb-4">{idea.description}</p>
                
                {idea.metrics && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {idea.metrics.potential_traffic && (
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Potential Traffic</p>
                        <p className="font-semibold">{idea.metrics.potential_traffic}</p>
                      </div>
                    )}
                    {idea.metrics.difficulty && (
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Difficulty</p>
                        <p className="font-semibold">{idea.metrics.difficulty}</p>
                      </div>
                    )}
                    {idea.metrics.relevance_score && (
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Relevance</p>
                        <p className="font-semibold">
                          {idea.metrics.relevance_score}%
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <p className="font-medium text-gray-700">Recommendations:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {idea.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-gray-600">{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
          {ideas.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-blue-500' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}