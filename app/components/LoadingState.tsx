'use client';

import { useState, useEffect } from 'react';
import { Spin, Alert, Progress } from 'antd';
import Image from 'next/image';
import { LoadingOutlined } from '@ant-design/icons';

type LoadingStateProps = {
  isLoading: boolean;
  error: string | null;
  loadingMessage?: string;
  progress?: number;
  tips?: string[];
};

export default function LoadingState({
  isLoading,
  error,
  loadingMessage,
  progress,
  tips = [
    'Analyzing your social data...',
    'Generating insights from your content...',
    'Optimizing your dashboard view...',
    'Preparing personalized recommendations...',
    'Almost there! Finalizing your results...'
  ],
}: LoadingStateProps) {
  const [currentTip, setCurrentTip] = useState(0);
  const [fadeState, setFadeState] = useState('in');

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setFadeState('out');
      
      setTimeout(() => {
        setCurrentTip((prev) => (prev + 1) % tips.length);
        setFadeState('in');
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, [isLoading, tips.length]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px] animate-fade-in-up">
        <div className="relative mb-6">
          <div className="absolute inset-0 animate-glow rounded-full bg-blue-500 opacity-20"></div>
          <div className="relative z-10">
            <Image 
              src="/favicon.ico" 
              alt="Loading" 
              width={64} 
              height={64} 
              className="animate-float" 
            />
          </div>
        </div>
        
        <Spin 
          indicator={
            <LoadingOutlined 
              style={{ fontSize: 36, color: '#1890ff' }} 
              spin 
            />
          } 
        />
        
        <div className="mt-6 text-center max-w-md">
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            {loadingMessage || 'Loading insights...'}
          </p>
          
          <div 
            className={`mt-3 text-gray-500 dark:text-gray-400 min-h-[3rem] transition-opacity duration-500 ${fadeState === 'in' ? 'opacity-100' : 'opacity-0'}`}
          >
            {tips[currentTip]}
          </div>
          
          {progress !== undefined && (
            <div className="mt-6 w-full max-w-xs mx-auto">
              <Progress 
                percent={progress} 
                status="active" 
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </div>
          )}
        </div>
        
        <div className="mt-8 flex space-x-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`h-2 w-2 rounded-full ${currentTip === i ? 'bg-blue-500' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert 
        message="Error" 
        description={error} 
        type="error" 
        showIcon 
        className="animate-fade-in-up"
      />
    );
  }

  return null;
}