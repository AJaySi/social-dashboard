'use client';

import { useState } from 'react';
import { Card, DatePicker } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { RangePicker } = DatePicker;

interface TrendsVisualizationProps {
  data: Array<{
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

export default function TrendsVisualization({ data }: TrendsVisualizationProps) {
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);

  const handleDateRangeChange = (dates: [Date, Date] | null) => {
    if (dates) {
      setDateRange([dates[0], dates[1]]);
    } else {
      setDateRange(null);
    }
  };

  const filteredData = dateRange
    ? data.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= dateRange[0] && itemDate <= dateRange[1];
      })
    : data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Historical Performance Trends</h3>
        <RangePicker onChange={handleDateRangeChange} className="border-gray-300" />
      </div>

      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <h4 className="text-lg font-medium text-gray-700 mb-4">Clicks & Impressions Over Time</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              activeDot={{ r: 8 }}
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
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <h4 className="text-lg font-medium text-gray-700 mb-4">CTR & Average Position Trends</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
      </Card>
    </div>
  );
}