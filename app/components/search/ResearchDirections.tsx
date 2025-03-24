'use client';

import { Card, List, Typography } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';

type ResearchDirection = {
  question: string;
  areas: string;
};

type ResearchDirectionsProps = {
  researchDirections: ResearchDirection[];
};

export default function ResearchDirections({ researchDirections }: ResearchDirectionsProps) {
  const { Title, Text, Paragraph } = Typography;

  return (
    <Card
      title={
        <div className="flex items-center">
          <ExperimentOutlined className="mr-2" />
          Research Directions
        </div>
      }
      className="mb-4"
    >
      <List
        itemLayout="vertical"
        dataSource={researchDirections}
        renderItem={(direction, index) => (
          <List.Item key={index}>
            <Title level={5} className="mb-2">
              {direction.question}
            </Title>
            <Paragraph type="secondary">
              {direction.areas}
            </Paragraph>
          </List.Item>
        )}
      />
    </Card>
  );
}