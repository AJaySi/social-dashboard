'use client';

import { Card, List, Tag, Typography, Progress } from 'antd';
import { LineChartOutlined, TruckOutlined } from '@ant-design/icons';
import { WarningOutlined } from '@ant-design/icons';


type SearchInsightsProps = {
  gscData: {
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
  rankingGap: {
    gsc_position: number;
    serp_positions: number[];
    position_difference: number;
  };
};

export default function SearchInsights({ gscData, rankingGap }: SearchInsightsProps) {
  const { Title, Text } = Typography;

  return (
    <div className="space-y-4">
      <Card
        title={
          <div className="flex items-center">
            <LineChartOutlined className="mr-2" />
            Search Performance
          </div>
        }
        className="mb-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Text type="secondary">Clicks</Text>
            <Title level={3}>{gscData.clicks.toLocaleString()}</Title>
          </div>
          <div>
            <Text type="secondary">Impressions</Text>
            <Title level={3}>{gscData.impressions.toLocaleString()}</Title>
          </div>
          <div>
            <Text type="secondary">CTR</Text>
            <Title level={3}>{(gscData.ctr * 100).toFixed(2)}%</Title>
          </div>
          <div>
            <Text type="secondary">Average Position</Text>
            <Title level={3}>{gscData.position.toFixed(1)}</Title>
          </div>
        </div>
      </Card>

      <Card
        title={
          <div className="flex items-center">
            <TruckOutlined className="mr-2" />
            Ranking Analysis
          </div>
        }
        className="mb-4"
      >
        <div className="space-y-4">
          <div>
            <Text>Current GSC Position</Text>
            <Progress
              percent={Math.min(100, (10 - rankingGap.gsc_position) * 10)}
              status="active"
              format={() => rankingGap.gsc_position.toFixed(1)}
            />
          </div>
          <div>
            <Text>SERP Position Difference</Text>
            <div className="flex items-center space-x-2">
              <Progress
                percent={Math.min(100, Math.abs(rankingGap.position_difference) * 10)}
                status={rankingGap.position_difference > 0 ? "exception" : "success"}
                format={() => rankingGap.position_difference.toFixed(1)}
              />
              <Tag color={rankingGap.position_difference > 0 ? "red" : "green"}>
                {rankingGap.position_difference > 0 ? "Lower" : "Higher"} than SERP
              </Tag>
            </div>
          </div>
        </div>
      </Card>

      <Card
        title={
          <div className="flex items-center">
            <LineChartOutlined className="mr-2" />
            Top Performing Pages
          </div>
        }
        className="mb-4"
      >
        <List
          dataSource={gscData.pages}
          renderItem={(page) => (
            <List.Item
              extra={
                <Tag color="blue">
                  Position: {page.position.toFixed(1)}
                </Tag>
              }
            >
              <List.Item.Meta
                title={page.page}
                description={
                  <div className="space-y-1">
                    <Text type="secondary">
                      Clicks: {page.clicks.toLocaleString()}
                    </Text>
                    <br />
                    <Text type="secondary">
                      Impressions: {page.impressions.toLocaleString()}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}