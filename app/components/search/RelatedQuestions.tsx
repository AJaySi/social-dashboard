'use client';

import { Card, List, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

type RelatedQuestionsProps = {
  questions: Array<{
    question: string;
    snippet: string;
  }>;
};

export default function RelatedQuestions({ questions }: RelatedQuestionsProps) {
  const { Title, Text } = Typography;

  return (
    <Card
      title={
        <div className="flex items-center">
          <QuestionCircleOutlined className="mr-2" />
          People Also Ask
        </div>
      }
      className="mb-4"
    >
      <List
        itemLayout="vertical"
        dataSource={questions}
        renderItem={(item) => (
          <List.Item>
            <div className="flex flex-col">
              <Title level={5} className="mb-2">
                {item.question}
              </Title>
              <Text type="secondary">{item.snippet}</Text>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
}