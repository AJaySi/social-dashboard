'use client';

interface TopPerformersProps {
  data: Array<{
    keyword: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

export default function TopPerformers({ data }: TopPerformersProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, i) => (
            <tr key={i}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.keyword}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.clicks}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.impressions}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(item.ctr * 100).toFixed(2)}%</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.position.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}