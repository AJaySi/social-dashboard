'use client';

export default function PricingPlans() {
  return (
    <section className="py-16 px-4 bg-gray-900 backdrop-blur-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-slow"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-4xl font-bold text-center text-white mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Free Plan */}
          <div className="relative p-8 rounded-2xl bg-gray-800 backdrop-blur border border-gray-700 hover:border-gray-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-blue-500/20 to-teal-500/20 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="mb-6">
                <h3 className="text-xl font-medium text-white mb-2">Free (Wife, Very Unhappy)</h3>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-600">$0</span>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <h4 className="text-lg font-medium text-white">Includes</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span className="text-gray-300">Access to all AI-powered features</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span className="text-gray-300">GSC integration for nerdy keyword insights</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span className="text-gray-300">Endless love from your future blogs</span>
                  </li>
                </ul>
              </div>
              <div className="flex gap-4">
                <button className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:from-green-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl w-full">
                  SIGN UP NOW
                </button>
                <button className="border border-gray-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors w-full transform hover:scale-105 transition-all duration-300">
                  EXPLORE
                </button>
              </div>
            </div>
          </div>

          {/* Pro-Free Plan */}
          <div className="relative p-8 rounded-2xl bg-gray-800 backdrop-blur border border-gray-700 hover:border-gray-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="mb-6">
                <h3 className="text-xl font-medium text-white mb-2">Pro-Free (Wife, Still Unhappy)</h3>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">$0</span>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <h4 className="text-lg font-medium text-white">Everything in Free, plus</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span className="text-gray-300">AI Insights to impress your boss</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span className="text-gray-300">Direct publishing to Wix, WordPress, and Facebook</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span className="text-gray-300">A sense of invincibility (terms apply)</span>
                  </li>
                </ul>
              </div>
              <div className="flex gap-4">
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl w-full">
                  UPGRADE FOR $0
                </button>
              </div>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="relative p-8 rounded-2xl bg-gray-800 backdrop-blur border border-gray-700 hover:border-gray-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="mb-6">
                <h3 className="text-xl font-medium text-white mb-2">Enterprise ($10, Wife Unhappy)</h3>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-600">$10</span>
                  <span className="text-gray-400 ml-2">/user/month</span>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <h4 className="text-lg font-medium text-white">Coming Soon</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span className="text-gray-300">Stay tuned for premium AI awesomeness</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span className="text-gray-300">Extra features your wife may still not care about</span>
                  </li>
                </ul>
              </div>
              <div className="flex gap-4">
                <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl w-full">
                  COMING SOON
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
