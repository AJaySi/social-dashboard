'use client';

import { Card, List, Tag, Typography, Tooltip, Button, Progress } from 'antd';
import { SearchOutlined, LinkOutlined, FileTextOutlined } from '@ant-design/icons';

type SearchResultsProps = {
  organicResults: Array<{
    position: number;
    title: string;
    link: string;
    snippet: string;
    displayed_link: string;
  }>;
  totalResults: number;
  onSummarize?: (url: string, title: string) => void;
  isSummarizing?: Record<string, boolean>;
  summaryProgress?: Record<string, number>;
  summaryStage?: Record<string, string>;
};

export default function SearchResults({ organicResults, totalResults, onSummarize, isSummarizing, summaryProgress, summaryStage }: SearchResultsProps) {
  const { Title, Text } = Typography;

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <span className="flex items-center">
            <SearchOutlined className="mr-2" />
            Search Results
          </span>
          <Tag color="blue">{totalResults ? totalResults.toLocaleString() : '0'} results</Tag>
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
              <div className="flex flex-col space-y-2">
                <Tag color="green" className="ml-2">
                  Position: {result.position}
                </Tag>
                {onSummarize && (
                  <div className="flex flex-col space-y-2">
                    <Button
                      type="primary"
                      icon={<FileTextOutlined />}
                      onClick={() => onSummarize(result.link, result.title)}
                      className="ml-2"
                      loading={isSummarizing?.[result.link]}
                      disabled={isSummarizing?.[result.link]}
                    >
                      {isSummarizing?.[result.link] ? 'Summarizing...' : 'Summarize'}
                    </Button>
                    
                    {isSummarizing?.[result.link] && summaryProgress?.[result.link] !== undefined && summaryProgress[result.link] > 0 && (
                      <div className="w-full px-2">
                        <Progress 
                          percent={summaryProgress?.[result.link] || 0} 
                          size="small" 
                          status="active" 
                        />
                        {summaryStage?.[result.link] && (
                          <div className="text-xs text-gray-500 mt-1">
                            {summaryStage[result.link]}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            }
          >
            <div className="flex flex-col">
              <Title level={5} className="mb-1">
                <a
                  href={result.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
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