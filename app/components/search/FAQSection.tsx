'use client';

import { useState, useEffect } from 'react';
import { Card, List, Typography, Collapse } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

type FAQSectionProps = {
  relatedQuestions: Array<{
    question: string;
    snippet: string;
  }>;
  relatedSearches?: Array<string | { query: string }>;
  query?: string;
};

export default function FAQSection({ relatedQuestions, relatedSearches = [], query }: FAQSectionProps) {
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateFAQs = async () => {
      if (!query) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/generate-faqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            relatedQuestions,
            relatedSearches,
            query
          })
        });

        if (!response.ok) throw new Error('Failed to generate FAQs');
        
        const generatedFaqs = await response.json();
        setFaqs(generatedFaqs);
      } catch (err) {
        console.error('Error generating FAQs:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate FAQs');
      } finally {
        setIsLoading(false);
      }
    };

    generateFAQs();
  }, [query, relatedQuestions, relatedSearches]);

  const { Title, Text } = Typography;
  const { Panel } = Collapse;

  return (
    <div className="space-y-4">
      <Card
        title={
          <div className="flex items-center">
            <QuestionCircleOutlined className="mr-2" />
            People Also Ask
          </div>
        }
        className="mb-4"
      >
        <Collapse>
          {relatedQuestions.map((item, index) => (
            <Panel header={item.question} key={index}>
              <Text type="secondary">{item.snippet}</Text>
            </Panel>
          ))}
        </Collapse>
      </Card>

      {faqs && faqs.length > 0 && (
        <Card
          title={
            <div className="flex items-center">
              <QuestionCircleOutlined className="mr-2" />
              Generated FAQs
            </div>
          }
          className="mb-4"
        >
          <List
            itemLayout="vertical"
            dataSource={faqs}
            renderItem={(faq, index) => (
              <List.Item key={index}>
                <Title level={5} className="mb-2">
                  {faq.question}
                </Title>
                <Text type="secondary">{faq.answer}</Text>
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
}