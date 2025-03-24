'use client';

import { Card, List, Typography, Collapse } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

type FAQSectionProps = {
  relatedQuestions: Array<{
    question: string;
    snippet: string;
  }>;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
};

export default function FAQSection({ relatedQuestions, faqs }: FAQSectionProps) {
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