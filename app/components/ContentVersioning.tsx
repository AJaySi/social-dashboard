/*
To implement a Content Performance Analyzer feature, I would create a new component that tracks content changes and their impact on search rankings over time. This would involve adding a content versioning system in the main editor, storing historical content versions with timestamps, and creating a comparison view showing before/after metrics for each content change. I would integrate this with the existing GSC data fetching mechanism and add visualization components to display performance trends correlated with specific content edits.

I need to examine the components related to content editing and GSC data to understand how to implement the Content Performance Analyzer feature.

social-dashboard\app\components\insights\TrendsVisualization.tsx

I need to understand the content editor implementation to see how we can track content changes and integrate with the GSC data.

social-dashboard\app\page.tsx

I need to examine the API endpoints that handle GSC data to understand how to integrate content versioning with search performance metrics.

social-dashboard\app\api\gsc\route.ts

I need to examine the API endpoint for insights to understand how we can integrate content versioning with search performance metrics.

social-dashboard\app\api\insights\gsc\route.ts

I need to understand how the content editor is currently implemented and how it interacts with the GSC data. Let me check the SearchConsoleData component to see how it fetches and processes data.

social-dashboard\app\components\SearchConsoleData.tsx

Based on the proposal, I need to create a new component for the Content Performance Analyzer. This component will track content changes and correlate them with search performance metrics. I'll start by creating the ContentVersioning component that will handle storing and comparing content versions.

social-dashboard\app\components\ContentVersioning.tsx

+ 320 - 0

Review

Now I need to create an API endpoint to handle fetching performance data for specific date ranges. This will be used by the ContentVersioning component to retrieve performance metrics for content versions.

social-dashboard\app\api\gsc\performance\route.ts

+ 84 - 0

Review

Now I need to update the main page component to integrate the ContentVersioning component with the content editor. This will allow users to save and track different versions of their content.

social-dashboard\app\page.tsx

+ 12 - 0

Review

I've implemented a Content Performance Analyzer feature that tracks content changes and correlates them with search performance metrics. The implementation includes:

1. A new`ContentVersioning` component that allows users to save different versions of their content and track performance metrics for each version.
2. A new API endpoint at`/api/gsc/performance` that fetches Google Search Console performance data for specific date ranges, which is used to analyze how content changes affect search performance.
3. Integration with the main page component to display the Content Performance Analyzer when a user is authenticated with Google.
The Content Performance Analyzer provides several key features:

- Saving content versions with timestamps
- Loading performance metrics for each version
- Comparing metrics between different versions with visualizations
- Viewing content differences between versions
- Tracking key metrics like clicks, impressions, CTR, and position
This implementation leverages the existing Google Search Console integration and authentication flow, making it seamless for users who are already connected to GSC. The feature uses localStorage for client-side storage of content versions and fetches real-time performance data from the Google Search Console API.
*/
'use client';

import { useState, useEffect } from 'react';
import { Button, Modal, Table, Tabs, Empty, Spin, Alert } from 'antd';
import { CiOutlined, SaveOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSession } from 'next-auth/react';

type ContentVersion = {
  id: string;
  content: string;
  timestamp: number;
  metrics?: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
};

type PerformanceData = {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

interface ContentVersioningProps {
  currentContent: string;
  onSaveVersion: () => void;
}

export default function ContentVersioning({ currentContent, onSaveVersion }: ContentVersioningProps) {
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  
  // Load saved versions from localStorage on component mount
  useEffect(() => {
    const savedVersions = localStorage.getItem('contentVersions');
    if (savedVersions) {
      setVersions(JSON.parse(savedVersions));
    }
  }, []);

  // Save current content as a new version
  const saveVersion = () => {
    if (!currentContent.trim()) return;
    
    const newVersion: ContentVersion = {
      id: Date.now().toString(),
      content: currentContent,
      timestamp: Date.now(),
    };
    
    const updatedVersions = [...versions, newVersion];
    setVersions(updatedVersions);
    localStorage.setItem('contentVersions', JSON.stringify(updatedVersions));
    onSaveVersion();
  };

  // Fetch performance data for a specific version
  const fetchPerformanceData = async (versionId: string) => {
    if (!session?.accessToken || session.provider !== 'google') {
      setError('Google authentication required to fetch performance data');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Get the version timestamp
      const version = versions.find(v => v.id === versionId);
      if (!version) return;
      
      const versionDate = new Date(version.timestamp);
      const endDate = new Date();
      
      // Format dates for API request
      const startDateStr = versionDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Fetch performance data from API
      const response = await fetch(`/api/gsc/performance?startDate=${startDateStr}&endDate=${endDateStr}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch performance data');
      }
      
      setPerformanceData(data.performanceData || []);
      
      // Update version with latest metrics
      if (data.performanceData && data.performanceData.length > 0) {
        const latestMetrics = data.performanceData[data.performanceData.length - 1];
        const updatedVersions = versions.map(v => {
          if (v.id === versionId) {
            return {
              ...v,
              metrics: {
                clicks: latestMetrics.clicks,
                impressions: latestMetrics.impressions,
                ctr: latestMetrics.ctr,
                position: latestMetrics.position
              }
            };
          }
          return v;
        });
        
        setVersions(updatedVersions);
        localStorage.setItem('contentVersions', JSON.stringify(updatedVersions));
      }
    } catch (err) {
      console.error('Error fetching performance data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Compare two versions
  const compareVersions = () => {
    if (selectedVersions.length !== 2) return;
    
    // Fetch performance data for both versions
    fetchPerformanceData(selectedVersions[0]);
    fetchPerformanceData(selectedVersions[1]);
    
    setIsModalVisible(true);
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Table columns for versions
  const columns = [
    {
      title: 'Date Created',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: number) => formatDate(timestamp),
      sorter: (a: ContentVersion, b: ContentVersion) => b.timestamp - a.timestamp,
    },
    {
      title: 'Content Preview',
      dataIndex: 'content',
      key: 'content',
      render: (content: string) => content.substring(0, 50) + (content.length > 50 ? '...' : ''),
    },
    {
      title: 'Metrics',
      key: 'metrics',
      render: (record: ContentVersion) => (
        record.metrics ? (
          <div className="text-xs">
            <div>Clicks: {record.metrics.clicks}</div>
            <div>Impressions: {record.metrics.impressions}</div>
            <div>CTR: {(record.metrics.ctr * 100).toFixed(2)}%</div>
            <div>Avg Position: {record.metrics.position.toFixed(1)}</div>
          </div>
        ) : (
          <Button size="small" onClick={() => fetchPerformanceData(record.id)}>
            Load Metrics
          </Button>
        )
      ),
    },
  ];

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Content Performance Analyzer</h2>
        <div className="space-x-2">
          <Button 
            icon={<SaveOutlined />} 
            onClick={saveVersion}
            type="primary"
          >
            Save Current Version
          </Button>
          <Button 
            icon={<CiOutlined />} 
            onClick={compareVersions}
            disabled={selectedVersions.length !== 2}
          >
            Compare Selected
          </Button>
        </div>
      </div>

      {versions.length === 0 ? (
        <Empty 
          description="No saved versions yet. Save your first version to start tracking performance."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Table
          rowSelection={{
            type: 'checkbox',
            onChange: (selectedRowKeys) => {
              setSelectedVersions(selectedRowKeys as string[]);
            },
            selectedRowKeys: selectedVersions,
            getCheckboxProps: (record) => ({
              disabled: selectedVersions.length >= 2 && !selectedVersions.includes(record.id)
            }),
          }}
          rowKey="id"
          columns={columns}
          dataSource={versions}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      )}

      <Modal
        title="Version Comparison"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        footer={null}
      >
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Spin size="large" />
          </div>
        ) : error ? (
          <Alert message="Error" description={error} type="error" showIcon />
        ) : (
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="Performance Comparison" key="1">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Clicks & Impressions Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="clicks"
                      stroke="#8884d8"
                      name="Clicks"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="impressions"
                      stroke="#82ca9d"
                      name="Impressions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">CTR & Position Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="ctr"
                      stroke="#ffc658"
                      name="CTR"
                      unit="%"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="position"
                      stroke="#ff7300"
                      name="Avg Position"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Tabs.TabPane>
            
            <Tabs.TabPane tab="Content Diff" key="2">
              {selectedVersions.length === 2 && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedVersions.map((versionId) => {
                    const version = versions.find(v => v.id === versionId);
                    return version ? (
                      <div key={versionId} className="border rounded p-4">
                        <h4 className="font-medium mb-2">{formatDate(version.timestamp)}</h4>
                        <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded text-sm overflow-auto max-h-96">
                          {version.content}
                        </pre>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </Tabs.TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
}