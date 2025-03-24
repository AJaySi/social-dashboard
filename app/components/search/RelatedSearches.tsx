'use client';

import { Card, List, Tag, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

type RelatedSearchesProps = {
  searches: Array<string | {
    query: string;
    items?: Array<string | { query: string }>;
    type?: 'search';
  }>;
};

export default function RelatedSearches({ searches }: RelatedSearchesProps) {
  const { Text } = Typography;

  const renderSearchItem = (search: string | { query: string; items?: Array<string | { query: string }>; type?: 'search' }) => {
    const query = typeof search === 'string' ? search : search.query;
    return (
      <List.Item>
        <div className="flex items-center">
          <SearchOutlined className="mr-2 text-gray-400" />
          <Text>{query}</Text>
        </div>
      </List.Item>
    );
  };

  return (
    <Card
      title={
        <div className="flex items-center">
          <SearchOutlined className="mr-2" />
          Related Searches
        </div>
      }
      className="mb-4"
    >
      <List
        itemLayout="horizontal"
        dataSource={searches}
        renderItem={renderSearchItem}
      />
    </Card>
  );
}