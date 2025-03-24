'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const rotatingTexts = [
  'Optimize Your Content Strategy',
  'Analyze Search Performance',
  'Generate AI-Powered Content',
  'Schedule Social Media Posts'
];

export default function LandingPage() {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prevIndex) => (prevIndex + 1) % rotatingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (provider: string) => {
    signIn(provider, { callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 z-0">
        <Image src="/hero-bg.svg" alt="Background" layout="fill" objectFit="cover" priority />
      </div>
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="relative w-16 h-16">
                <Image src="/favicon.ico" alt="ALwrity" layout="fill" objectFit="contain" className="animate-pulse" />
              </div>
              <h1 className="text-7xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600 animate-gradient">
                ALwrity Blog Writer
              </h1>
            </div>
            <div className="h-24 mb-6">
              <p className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 transition-all duration-500 animate-gradient">
                {rotatingTexts[textIndex]}
              </p>
            </div>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your content creation process with AI-powered insights, SEO optimization, and automated publishing. Write engaging blogs that rank higher and convert better.
            </p>
            <div className="space-y-4 mb-12 max-w-md mx-auto">
              <button
                onClick={() => handleLogin('google')}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Image src="/google.svg" alt="Google" width={24} height={24} />
                <span className="font-semibold">Get Started with Google</span>
              </button>

              <button
                onClick={() => handleLogin('facebook')}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-[#1877F2] text-white rounded-lg hover:bg-[#1865F2] transition duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Image src="/facebook.svg" alt="Facebook" width={24} height={24} />
                <span className="font-semibold">Continue with Facebook</span>
              </button>

              <button
                onClick={() => handleLogin('linkedin')}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-[#0A66C2] text-white rounded-lg hover:bg-[#0952C2] transition duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Image src="/linkedin.svg" alt="LinkedIn" width={24} height={24} />
                <span className="font-semibold">Continue with LinkedIn</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4">
              <div className="col-span-3 text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">How ALwrity Works</h2>
                <div className="relative py-16">
                  <div className="absolute inset-0 opacity-5">
                    <Image src="/favicon.ico" alt="ALwrity" layout="fill" objectFit="contain" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    <div className="p-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 mx-auto">1</div>
                      <h3 className="text-xl font-semibold text-white mb-3">Connect & Analyze</h3>
                      <p className="text-gray-300">Connect your Google Search Console and let ALwrity analyze your content performance</p>
                    </div>
                    <div className="p-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 mx-auto">2</div>
                      <h3 className="text-xl font-semibold text-white mb-3">Generate & Optimize</h3>
                      <p className="text-gray-300">Use AI-powered tools to generate optimized content and get actionable insights</p>
                    </div>
                    <div className="p-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 mx-auto">3</div>
                      <h3 className="text-xl font-semibold text-white mb-3">Schedule & Track</h3>
                      <p className="text-gray-300">Schedule your content across platforms and track performance metrics in real-time</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 border border-white/20">
                <div className="mb-6">
                  <Image src="/features/content-editor.svg" alt="AI Research" width={64} height={64} className="mx-auto" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">AI-Powered Research</h3>
                <p className="text-gray-300">Generate comprehensive research and content suggestions using advanced AI algorithms</p>
              </div>
              <div className="p-8 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 border border-white/20">
                <div className="mb-6">
                  <Image src="/features/analytics.svg" alt="Search Console" width={64} height={64} className="mx-auto" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Search Console Insights</h3>
                <p className="text-gray-300">Track performance metrics and get actionable insights from Google Search Console</p>
              </div>
              <div className="p-8 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 border border-white/20">
                <div className="mb-6">
                  <Image src="/features/social-integration.svg" alt="AI Insights" width={64} height={64} className="mx-auto" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">AI Insights</h3>
                <p className="text-gray-300">Get intelligent recommendations and optimize your content strategy with AI</p>
              </div>
              <div className="p-6 bg-gray-800 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Image src="/features/content-editor.svg" alt="Content Editor" width={48} height={48} className="mb-4 text-blue-400" />
                <h3 className="text-xl font-semibold text-white mb-4">Content Editor</h3>
                <p className="text-gray-400">Create and optimize content with AI-powered suggestions, real-time SEO feedback, and smart content analysis</p>
              </div>
              <div className="p-6 bg-gray-800 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Image src="/features/analytics.svg" alt="Analytics" width={48} height={48} className="mb-4 text-green-400" />
                <h3 className="text-xl font-semibold text-white mb-4">Analytics</h3>
                <p className="text-gray-400">Track performance metrics, keyword rankings, and detailed insights from Google Search Console with visual analytics</p>
              </div>
              <div className="p-6 bg-gray-800 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Image src="/features/social-integration.svg" alt="Social Integration" width={48} height={48} className="mb-4 text-purple-400" />
                <h3 className="text-xl font-semibold text-white mb-4">Social Integration</h3>
                <p className="text-gray-400">Schedule and manage posts across multiple social platforms with smart scheduling and engagement analytics</p>
              </div>
            </div>

            <button
              className="w-full md:w-64 mx-auto mb-8 flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={() => {
                const loginSection = document.getElementById('login-options');
                loginSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="text-lg font-semibold">Get Started Now</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            <div className="mt-24 relative overflow-hidden py-16 bg-gray-900 backdrop-blur-lg rounded-3xl shadow-lg border border-gray-700 transform hover:scale-[1.01] transition-all duration-300 ease-in-out">
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-slow"></div>
              </div>
              <div className="relative max-w-4xl mx-auto px-6 text-center">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-20 h-20 animate-bounce-slow">
                    <Image src="/favicon.ico" alt="ALwrity" layout="fill" objectFit="contain" className="filter drop-shadow-lg"/>
                  </div>
                </div>
                <h2 className="text-4xl font-bold mb-6 text-white">Powered by Innovation, Driven by Community</h2>
                <p className="text-xl text-gray-300 leading-relaxed mb-8 max-w-3xl mx-auto">
                  ALwrity is a free and open-source blog writing assistant powered by Google Gemini and advanced AI insights. Create content that resonates and ranks with real-time SEO analytics and AI-powered suggestions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="p-4 bg-gray-800 backdrop-blur rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]">
                    <Image src="/google.svg" alt="Google" width={32} height={32} className="mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">Powered by Gemini</h3>
                    <p className="text-sm text-gray-300">Advanced AI for smarter content creation</p>
                  </div>
                  <div className="p-4 bg-gray-800 backdrop-blur rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]">
                    <svg className="w-8 h-8 text-green-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-white mb-2">Open Source</h3>
                    <p className="text-sm text-gray-300">100% free and community-driven</p>
                  </div>
                  <div className="p-4 bg-gray-800 backdrop-blur rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]">
                    <svg className="w-8 h-8 text-blue-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-white mb-2">Real-time Insights</h3>
                    <p className="text-sm text-gray-300">SEO analytics and optimization</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-24 relative overflow-hidden py-16 bg-gray-900 backdrop-blur-lg rounded-3xl shadow-lg border border-gray-700 transform hover:scale-[1.01] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 animate-pulse-slow"></div>
              <div className="relative max-w-5xl mx-auto px-6">
                <h2 className="text-4xl font-bold text-center text-white mb-8" data-aos="fade-up">Your Content Creation Journey</h2>
                <p className="text-xl text-gray-300 text-center mb-12" data-aos="fade-up" data-aos-delay="100">Follow our proven process to create high-performing content that engages your audience and drives results</p>
                <div className="relative" data-aos="fade-up" data-aos-delay="200">
                  <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl animate-pulse-slow" height="800" viewBox="0 0 800 800">
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#60A5FA" />
                      </marker>
                      <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                    
                    <path d="M400,50 L400,750" stroke="#60A5FA" strokeWidth="2" strokeDasharray="4" opacity="0.5" />
                    
                    <path d="M100,100 L700,100" stroke="url(#flowGradient)" strokeWidth="2" markerEnd="url(#arrowhead)" className="animate-draw" />
                    <path d="M700,175 L100,175" stroke="url(#flowGradient)" strokeWidth="2" markerEnd="url(#arrowhead)" className="animate-draw" />
                    <path d="M100,250 L700,250" stroke="url(#flowGradient)" strokeWidth="2" markerEnd="url(#arrowhead)" className="animate-draw" />
                    <path d="M700,325 L100,325" stroke="url(#flowGradient)" strokeWidth="2" markerEnd="url(#arrowhead)" className="animate-draw" />
                    <path d="M100,400 L700,400" stroke="url(#flowGradient)" strokeWidth="2" markerEnd="url(#arrowhead)" className="animate-draw" />
                    <path d="M700,475 L100,475" stroke="url(#flowGradient)" strokeWidth="2" markerEnd="url(#arrowhead)" className="animate-draw" />
                    <path d="M100,550 L700,550" stroke="url(#flowGradient)" strokeWidth="2" markerEnd="url(#arrowhead)" className="animate-draw" />
                    <path d="M700,625 L100,625" stroke="url(#flowGradient)" strokeWidth="2" markerEnd="url(#arrowhead)" className="animate-draw" />
                    <path d="M100,700 L700,700" stroke="url(#flowGradient)" strokeWidth="2" markerEnd="url(#arrowhead)" className="animate-draw" />
                  </svg>
                  
                  <div className="grid grid-cols-2 gap-8" data-aos="fade-up" data-aos-delay="200">
                    <div className="p-6 bg-gray-800/90 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 ml-4 relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <div className="absolute -right-2 -top-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">✓</div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">1</div>
                        <h3 className="text-xl font-semibold text-white">Connect GSC</h3>
                      </div>
                      <p className="text-gray-300">Connect your Google Search Console to analyze your blog's performance</p>
                    </div>
                    
                    <div className="p-6 bg-gray-800/90 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 mr-4 mt-16 relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <div className="absolute -right-2 -top-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">✓</div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">2</div>
                        <h3 className="text-xl font-semibold text-white">Keyword Analysis</h3>
                      </div>
                      <p className="text-gray-300">ALwrity analyzes your blog keywords and suggests optimized search queries</p>
                    </div>

                    <div className="p-6 bg-gray-800/90 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 ml-4 mt-16 relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <div className="absolute -right-2 -top-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">✓</div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">3</div>
                        <h3 className="text-xl font-semibold text-white">SERP Analysis</h3>
                      </div>
                      <p className="text-gray-300">Analyzes top search results and provides comprehensive summaries</p>
                    </div>

                    <div className="p-6 bg-gray-800/90 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 mr-4 mt-16 relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <div className="absolute -right-2 -top-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">✓</div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">4</div>
                        <h3 className="text-xl font-semibold text-white">AI Insights</h3>
                      </div>
                      <p className="text-gray-300">Combines GSC data and SERP analysis to generate actionable insights</p>
                    </div>

                    <div className="p-6 bg-gray-800/90 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 ml-4 mt-16 relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <div className="absolute -right-2 -top-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">✓</div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">5</div>
                        <h3 className="text-xl font-semibold text-white">Blog Outline</h3>
                      </div>
                      <p className="text-gray-300">Creates customizable blog outlines based on AI analysis</p>
                    </div>

                    <div className="p-6 bg-gray-800/90 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 mr-4 mt-16 relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <div className="absolute -right-2 -top-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">✓</div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">6</div>
                        <h3 className="text-xl font-semibold text-white">Content Creation</h3>
                      </div>
                      <p className="text-gray-300">Generates high-quality blog content from your approved outline</p>
                    </div>

                    <div className="p-6 bg-gray-800/90 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 ml-4 mt-16 relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <div className="absolute -right-2 -top-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">✓</div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">7</div>
                        <h3 className="text-xl font-semibold text-white">AI Enhancement</h3>
                      </div>
                      <p className="text-gray-300">Enhances content with coherency checks and narrative flow optimization</p>
                    </div>

                    <div className="p-6 bg-gray-800/90 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 mr-4 mt-16 relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <div className="absolute -right-2 -top-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">✓</div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">8</div>
                        <h3 className="text-xl font-semibold text-white">Social Publishing</h3>
                      </div>
                      <p className="text-gray-300">Schedule and optimize content for different social media platforms</p>
                    </div>

                    <div className="p-6 bg-gray-800/90 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 ml-4 mt-16 relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <div className="absolute -right-2 -top-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">✓</div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">9</div>
                        <h3 className="text-xl font-semibold text-white">Visual Generation</h3>
                      </div>
                      <p className="text-gray-300">Create engaging visuals and graphics for your blog content</p>
                    </div>
                  </div>
                </div>
              </div>
                <h2 className="text-4xl font-bold text-center text-white mb-16">How ALwrity Works</h2>
                <div className="relative" data-aos="fade-up" data-aos-delay="200">
                  <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl" height="600" viewBox="0 0 800 600">
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#60A5FA" />
                      </marker>
                    </defs>
                    <path d="M400,50 L400,550" stroke="#60A5FA" strokeWidth="2" strokeDasharray="4" opacity="0.5" />
                    <path d="M100,100 L700,100" stroke="#60A5FA" strokeWidth="2" markerEnd="url(#arrowhead)" className="animate-draw" />
                    <path d="M700,175 L100,175" stroke="#60A5FA" strokeWidth="2" markerEnd="url(#arrowhead)" className="animate-draw" />
                    <path d="M100,250 L700,250" stroke="#60A5FA" strokeWidth="2" markerEnd="url(#arrowhead)" className="animate-draw" />
                    <path d="M700,325 L100,325" stroke="#60A5FA" strokeWidth="2" markerEnd="url(#arrowhead)" className="animate-draw" />
                    <path d="M100,400 L700,400" stroke="#60A5FA" strokeWidth="2" markerEnd="url(#arrowhead)" className="animate-draw" />
                    <path d="M700,475 L100,475" stroke="#60A5FA" strokeWidth="2" markerEnd="url(#arrowhead)" className="animate-draw" />
                  </svg>
                  
                  <div className="grid grid-cols-2 gap-8" data-aos="fade-up" data-aos-delay="200">
                    <div className="p-6 bg-gray-800/90 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 ml-4 relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <div className="absolute -right-2 -top-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">✓</div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">1</div>
                        <h3 className="text-xl font-semibold text-white">Connect GSC</h3>
                      </div>
                      <p className="text-gray-300">Connect your Google Search Console to analyze your blog's performance</p>
                    </div>
                    
                    <div className="p-6 bg-gray-800/90 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 mr-4 mt-16 relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <div className="absolute -right-2 -top-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">✓</div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">2</div>
                        <h3 className="text-xl font-semibold text-white">Keyword Analysis</h3>
                      </div>
                      <p className="text-gray-300">ALwrity analyzes your blog keywords and suggests optimized search queries</p>
                    </div>

                    <div className="p-6 bg-gray-800/90 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 ml-4 mt-16 relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <div className="absolute -right-2 -top-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">✓</div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">3</div>
                        <h3 className="text-xl font-semibold text-white">SERP Analysis</h3>
                      </div>
                      <p className="text-gray-300">Analyzes top search results and provides comprehensive summaries</p>
                    </div>

                    <div className="p-6 bg-gray-800/90 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 mr-4 mt-16 relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <div className="absolute -right-2 -top-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">✓</div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">4</div>
                        <h3 className="text-xl font-semibold text-white">AI Insights</h3>
                      </div>
                      <p className="text-gray-300">Combines GSC data and SERP analysis to generate actionable insights</p>
                    </div>

                    <div className="p-6 bg-gray-800/90 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 ml-4 mt-16 relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <div className="absolute -right-2 -top-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">✓</div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">5</div>
                        <h3 className="text-xl font-semibold text-white">Blog Outline</h3>
                      </div>
                      <p className="text-gray-300">Creates customizable blog outlines based on AI analysis</p>
                    </div>

                    <div className="p-6 bg-gray-800/90 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 mr-4 mt-16 relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <div className="absolute -right-2 -top-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">✓</div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">6</div>
                        <h3 className="text-xl font-semibold text-white">Content Creation</h3>
                      </div>
                      <p className="text-gray-300">Generates high-quality blog content from your approved outline</p>
                    </div>

                    <div className="p-6 bg-gray-800/90 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 mr-4 mt-16 relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <div className="absolute -right-2 -top-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">✓</div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">7</div>
                        <h3 className="text-xl font-semibold text-white">AI Enhancement</h3>
                      </div>
                      <p className="text-gray-300">Enhances content with coherency checks and narrative flow optimization</p>
                    </div>

                    <div className="p-6 bg-gray-800/90 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 ml-4 mt-16 relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <div className="absolute -right-2 -top-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">✓</div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">8</div>
                        <h3 className="text-xl font-semibold text-white">Social Publishing</h3>
                      </div>
                      <p className="text-gray-300">Schedule and optimize content for different social media platforms</p>
                    </div>

                    <div className="p-6 bg-gray-800/90 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 mr-4 mt-16 relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <div className="absolute -right-2 -top-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">✓</div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">9</div>
                        <h3 className="text-xl font-semibold text-white">Visual Generation</h3>
                      </div>
                      <p className="text-gray-300">Create engaging visuals and graphics for your blog content</p>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}