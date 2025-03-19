'use client';

interface ContentGapsProps {
  data: Array<{
    keyword: string;
    suggestion: string;
    currentCTR: number;
    position: number;
    impressions: number;
  }>;
}

export default function ContentGaps({ data }: ContentGapsProps) {
  return (
    <div className="space-y-4">
      {data.map((item, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-900">{item.keyword}</h4>
              <p className="mt-1 text-sm text-gray-600">{item.suggestion}</p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              CTR: {(item.currentCTR * 100).toFixed(2)}%
            </span>
          </div>
          <dl className="mt-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <dt>Position:</dt>
              <dd>{item.position.toFixed(1)}</dd>
            </div>
            <div className="flex justify-between mt-1">
              <dt>Impressions:</dt>
              <dd>{item.impressions}</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}