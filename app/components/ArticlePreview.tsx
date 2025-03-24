'use client';

import React from 'react';
import { Modal } from 'antd';
import ReactMarkdown from 'react-markdown';

interface ArticlePreviewProps {
  article: {
    title: string;
    summary: string;
  } | null;
  onClose: () => void;
}

export default function ArticlePreview({ article, onClose }: ArticlePreviewProps) {
  const markdownComponents = {
    h1: ({ children }: { children: React.ReactNode }) => (
      <h1 className="text-2xl font-bold mb-4 text-gray-800">{children}</h1>
    ),
    h2: ({ children }: { children: React.ReactNode }) => (
      <h2 className="text-xl font-semibold mb-3 text-gray-700">{children}</h2>
    ),
    h3: ({ children }: { children: React.ReactNode }) => (
      <h3 className="text-lg font-medium mb-2 text-gray-600">{children}</h3>
    ),
    p: ({ children }: { children: React.ReactNode }) => (
      <p className="mb-4 text-gray-600">{children}</p>
    ),
    ul: ({ children }: { children: React.ReactNode }) => (
      <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
    ),
    li: ({ children }: { children: React.ReactNode }) => (
      <li className="text-gray-600">{children}</li>
    ),
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 text-gray-600 bg-blue-50">
        {children}
      </blockquote>
    ),
    code: ({ node, inline, className, children, ...props }: { 
      node?: unknown; 
      inline?: boolean; 
      className?: string; 
      children: React.ReactNode 
    }) => {
      if (inline) {
        return (
          <code className="bg-gray-100 rounded px-1 py-0.5 text-sm font-mono" {...props}>
            {children}
          </code>
        );
      }
      return (
        <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto">
          <code className={className} {...props}>{children}</code>
        </pre>
      );
    },
    strong: ({ children }: { children: React.ReactNode }) => (
      <strong className="font-semibold text-gray-800">{children}</strong>
    ),
    em: ({ children }: { children: React.ReactNode }) => (
      <em className="italic text-gray-700">{children}</em>
    ),
    a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
      <a 
        href={href} 
        className="text-blue-600 hover:text-blue-800 underline" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        {children}
      </a>
    )
  };

  if (!article) return null;

  return (
    <Modal
      title={article.title}
      open={!!article}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <div className="prose max-w-none">
        <ReactMarkdown components={markdownComponents}>
          {article.summary}
        </ReactMarkdown>
      </div>
    </Modal>
  );
}