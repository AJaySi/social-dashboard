'use client';

import { Card, Tag, Tooltip } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';

interface OptimizationOpportunitiesProps {
  data: Array<{
    keyword: string;
    currentPosition: number;
    impressions: number;
    potentialTraffic: number;
    opportunity?: {
      trafficGain: number;
      effort: string;
      impactPotential: string;
    };
    recommendation: string;
  }>;
}

export default function OptimizationOpportunities({ data }: OptimizationOpportunitiesProps) {
  const getEffortColor = (effort: string = 'medium') => {
    switch (effort.toLowerCase()) {
      case 'low':
        return 'green';
      case 'medium':
        return 'gold';
      case 'high':
        return 'red';
      default:
        return 'blue';
    }
  };

  const getImpactColor = (impact: string = 'medium') => {
    switch (impact.toLowerCase()) {
      case 'high':
        return 'green';
      case 'medium':
        return 'blue';
      case 'low':
        return 'orange';
      default:
        return 'blue';
    }
  };

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <Card key={index} className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-1">{item.keyword}</h4>
                <div className="flex gap-2 mb-2">
                  <Tooltip title="Required effort level">
                    <Tag color={getEffortColor(item.opportunity?.effort)}>
                      {(item.opportunity?.effort || 'MEDIUM').toUpperCase()} EFFORT
                    </Tag>
                  </Tooltip>
                  <Tooltip title="Potential impact on traffic">
                    <Tag color={getImpactColor(item.opportunity?.impactPotential)}>
                      {(item.opportunity?.impactPotential || 'MEDIUM').toUpperCase()} IMPACT
                    </Tag>
                  </Tooltip>
                </div>
              </div>
              <Tooltip title="Current position in search results">
                <div className="text-right">
                  <span className="text-sm text-gray-500">Position</span>
                  <div className="text-xl font-bold text-blue-600">{item.currentPosition}</div>
                </div>
              </Tooltip>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Tooltip title="Current monthly impressions">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm text-gray-500">Impressions</div>
                  <div className="text-lg font-semibold">{(item.impressions || 0).toLocaleString()}</div>
                </div>
              </Tooltip>
              <Tooltip title="Potential monthly traffic">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm text-gray-500">Potential Traffic</div>
                  <div className="text-lg font-semibold text-green-600">
                    {(item.potentialTraffic || 0).toLocaleString()}
                  </div>
                </div>
              </Tooltip>
              <Tooltip title="Estimated traffic increase">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm text-gray-500">Traffic Gain</div>
                  <div className="text-lg font-semibold text-green-600 flex items-center justify-center">
                    <ArrowUpOutlined className="mr-1" />
                    {(item.opportunity?.trafficGain || 0).toLocaleString()}
                  </div>
                </div>
              </Tooltip>
            </div>

            <div className="mt-3">
              <Tooltip title="Optimization recommendation">
                <p className="text-sm text-gray-600 italic">{item.recommendation}</p>
              </Tooltip>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}