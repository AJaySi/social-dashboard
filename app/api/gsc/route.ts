import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { google } from 'googleapis';
import { GaxiosResponse } from 'googleapis-common';
import { webmasters_v3 } from 'googleapis';
import { NextResponse } from 'next/server';

const webmasters = google.webmasters('v3');

export async function GET() {
  try {
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
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const { data: searchAnalytics } = await webmasters.searchanalytics.query({
      auth,
      siteUrl: site,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 10
      }
    } as webmasters_v3.Params$Resource$Searchanalytics$Query);

    return NextResponse.json({
      site,
      searchAnalytics: searchAnalytics.rows || []
    });
  } catch (error) {
    console.error('Error fetching GSC data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search console data' },
      { status: 500 }
    );
  }
}