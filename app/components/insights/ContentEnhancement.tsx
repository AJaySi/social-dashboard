'use client';

interface ContentEnhancementProps {
  data: Array<{
    keyword: string;
    recommendedAction: string;
    metrics: {
      currentCTR: number;
      position: number;
      impressions: number;
    };
    potential: {
      targetCTR: number;
      potentialClicks: number;
      additionalClicks: number;
    };
  }>;
}

export default function ContentEnhancement({ data }: ContentEnhancementProps) {
  return (
    <div className="space-y-4">
      {data.map((item, i) => (
        <div key={i} className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-purple-100">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-900">{item.keyword}</h4>
              <p className="mt-1 text-sm text-gray-600">{item.recommendedAction}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Enhancement
              </span>
            </div>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <dt className="font-medium">Current Metrics</dt>
              <dd className="mt-1">
                <ul className="list-disc list-inside space-y-1">
                  <li>CTR: {(item.metrics.currentCTR * 100).toFixed(2)}%</li>
                  <li>Position: {item.metrics.position.toFixed(1)}</li>
                  <li>Impressions: {item.metrics.impressions}</li>
                </ul>
              </dd>
            </div>
            <div>
              <dt className="font-medium">Potential Impact</dt>
              <dd className="mt-1">
                <ul className="list-disc list-inside space-y-1">
                  <li>Target CTR: {(item.potential.targetCTR * 100).toFixed(2)}%</li>
                  <li>Potential Clicks: {item.potential.potentialClicks}</li>
                  <li>Additional Clicks: +{item.potential.additionalClicks}</li>
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}