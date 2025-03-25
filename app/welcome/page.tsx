'use client';

import { Card, Typography, Steps, Button } from 'antd';
import { SearchOutlined, LinkOutlined, LineChartOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Title level={1} className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Social Dashboard
          </Title>
          <Text className="text-xl text-gray-600">
            Let's get you started by connecting your Google Search Console account
          </Text>
        </div>

        <Card className="shadow-lg rounded-2xl mb-8">
          <Title level={2} className="text-2xl mb-6">
            Why Connect Google Search Console?
          </Title>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <SearchOutlined className="text-4xl text-blue-500 mb-4" />
              <Title level={3} className="text-lg mb-2">Track Keywords</Title>
              <Text className="text-gray-600">
                Monitor your website's search performance and discover which keywords drive traffic
              </Text>
            </div>
            <div className="text-center p-4">
              <LineChartOutlined className="text-4xl text-green-500 mb-4" />
              <Title level={3} className="text-lg mb-2">Analyze Performance</Title>
              <Text className="text-gray-600">
                Get detailed insights about clicks, impressions, CTR, and search rankings
              </Text>
            </div>
            <div className="text-center p-4">
              <LinkOutlined className="text-4xl text-purple-500 mb-4" />
              <Title level={3} className="text-lg mb-2">Optimize Content</Title>
              <Text className="text-gray-600">
                Improve your content strategy with data-driven insights and recommendations
              </Text>
            </div>
          </div>
        </Card>

        <Card className="shadow-lg rounded-2xl mb-8">
          <Title level={2} className="text-2xl mb-6">
            Getting Started
          </Title>
          <Steps
            direction="vertical"
            current={-1}
            items={[
              {
                title: 'Sign in with Google',
                description: 'Use your Google account that has access to Google Search Console',
              },
              {
                title: 'Select Your Website',
                description: 'Choose the website you want to analyze from your GSC properties',
              },
              {
                title: 'Start Optimizing',
                description: 'Access powerful insights and tools to improve your search performance',
              },
            ]}
          />
        </Card>

        <div className="text-center">
          <Link href="/auth/signin" passHref>
            <Button
              type="primary"
              size="large"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Connect Google Search Console
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}