'use client';

import { Spin, Alert } from 'antd';

type LoadingStateProps = {
  isLoading: boolean;
  error: string | null;
  loadingMessage?: string;
};

export default function LoadingState({ isLoading, error, loadingMessage }: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Spin size="large" />
        <p className="mt-4 text-gray-600">{loadingMessage || 'Loading insights...'}</p>
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  return null;
}