import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { google } from 'googleapis';
import { webmasters_v3 } from 'googleapis';
import { NextResponse } from 'next/server';

const webmasters = google.webmasters('v3');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate parameters are required' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.accessToken || session.provider !== 'google') {
      return NextResponse.json(
        { error: 'Not authenticated with Google' },
        { status: 401 }
      );
    }

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_ID,
      process.env.GOOGLE_SECRET
    );
    auth.setCredentials({ access_token: session.accessToken });

    // Get the list of verified sites
    const { data: siteList } = await webmasters.sites.list({
      auth
    });

    if (!siteList.siteEntry?.length) {
      return NextResponse.json(
        { error: 'No verified sites found' },
        { status: 404 }
      );
    }

    // Get search analytics data for the first verified site
    const site = siteList.siteEntry[0].siteUrl;

    // Get daily performance data for the date range
    const { data: searchAnalytics } = await webmasters.searchanalytics.query({
      auth,
      siteUrl: site,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['date'],
        rowLimit: 100
      }
    } as webmasters_v3.Params$Resource$Searchanalytics$Query);

    // Format the performance data
    const performanceData = searchAnalytics.rows?.map(row => ({
      date: row.keys?.[0] || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0
    })) || [];

    return NextResponse.json({
      site,
      performanceData
    });
  } catch (error) {
    console.error('Error fetching GSC performance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search console performance data' },
      { status: 500 }
    );
  }
}