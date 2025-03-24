'use client';

import { Card, List, Tag, Typography, Tooltip } from 'antd';
import { SearchOutlined, LinkOutlined } from '@ant-design/icons';

type OrganicResultsProps = {
  organicResults: Array<{
    position: number;
    title: string;
    link: string;
    snippet: string;
    displayed_link: string;
  }>;
  totalResults: number;
  onArticleClick?: (article: any) => void;
};

export default function OrganicResults({ organicResults, totalResults, onArticleClick }: OrganicResultsProps) {
  const { Title, Text } = Typography;

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <span className="flex items-center">
            <SearchOutlined className="mr-2" />
            Search Results
          </span>
          <Tag color="blue">{totalResults.toLocaleString()} results</Tag>
        </div>
      }
      className="mb-4"
    >
      <List
        itemLayout="vertical"
        dataSource={organicResults}
        renderItem={(result) => (
          <List.Item
            extra={
              <Tag color="green" className="ml-2">
                Position: {result.position}
              </Tag>
            }
            onClick={() => onArticleClick?.(result)}
            className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex flex-col">
              <Title level={5} className="mb-1">
                <a
                  href={result.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  {result.title}
                </a>
              </Title>
              <Tooltip title={result.link}>
                <Text type="secondary" className="flex items-center mb-2">
                  <LinkOutlined className="mr-1" />
                  {result.displayed_link}
                </Text>
              </Tooltip>
              <Text>{result.snippet}</Text>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
}