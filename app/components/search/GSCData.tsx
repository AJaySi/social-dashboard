'use client';

import { Card, Tag, Typography } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';

type GSCDataProps = {
  data: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    pages: Array<{
      page: string;
      clicks: number;
      impressions: number;
      position: number;
    }>;
  };
};

export default function GSCData({ data }: GSCDataProps) {
  const { Title, Text } = Typography;

  return (
    <Card
      title={
        <div className="flex items-center">
          <LineChartOutlined className="mr-2" />
          Search Console Metrics
        </div>
      }
      className="mb-4"
    >
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Title level={5}>Clicks</Title>
          <Text>{data.clicks.toLocaleString()}</Text>
        </div>
        <div>
          <Title level={5}>Impressions</Title>
          <Text>{data.impressions.toLocaleString()}</Text>
        </div>
        <div>
          <Title level={5}>CTR</Title>
          <Text>{(data.ctr * 100).toFixed(2)}%</Text>
        </div>
        <div>
          <Title level={5}>Average Position</Title>
          <Text>{data.position.toFixed(1)}</Text>
        </div>
      </div>

      <div>
        <Title level={5} className="mb-3">Top Performing Pages</Title>
        {data.pages.map((page, index) => (
          <div key={index} className="mb-2 pb-2 border-b border-gray-200 last:border-0">
            <div className="flex justify-between items-center">
              <Text className="truncate flex-1" title={page.page}>
                {page.page}
              </Text>
              <Tag color="blue" className="ml-2">
                Position: {page.position.toFixed(1)}
              </Tag>
            </div>
            <div className="flex gap-4 mt-1">
              <Text type="secondary">Clicks: {page.clicks}</Text>
              <Text type="secondary">Impressions: {page.impressions}</Text>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}