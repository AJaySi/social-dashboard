# Social Media Dashboard

A modern social media dashboard built with Next.js that provides insights and analytics from Google Search Console. The application features a content editor with real-time SEO insights and performance metrics.

## Features

- Content editor with real-time feedback
- Google Search Console integration
- SEO insights and analytics
- Performance metrics visualization
- Responsive design with modern UI

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 18 or higher)
- npm or yarn package manager
- A Google account with access to Google Search Console

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd social-dashboard
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add your Google OAuth credentials:
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
/app
  /api        # API routes
  /auth       # Authentication configuration
  /components # React components
  /public     # Static assets
  /types      # TypeScript type definitions
```

## Key Features

### Content Editor
A powerful text editor for creating and editing content with real-time SEO suggestions.

### GSC Insights
- **Top Performers**: View your best performing content and keywords
- **Quick Wins**: Identify opportunities for rapid improvement
- **Content Gaps**: Discover areas where content could be expanded
- **Growth Opportunities**: Find potential areas for traffic growth
- **Optimization Opportunities**: Get suggestions for SEO improvements

## Technologies Used

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Next-Auth
- Google Search Console API

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
