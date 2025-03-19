import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { apiKey, accountId } = await req.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API Key is required' },
        { status: 400 }
      );
    }

    if (!accountId || typeof accountId !== 'string') {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Update .env file
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.existsSync(envPath)
      ? fs.readFileSync(envPath, 'utf-8')
      : '';

    const envLines = envContent.split('\n');
    const newEnvLines = envLines.filter(line => 
      !line.startsWith('WIX_API_KEY=') && 
      !line.startsWith('WIX_ACCOUNT_ID=')
    );

    newEnvLines.push(`WIX_API_KEY=${apiKey}`);
    newEnvLines.push(`WIX_ACCOUNT_ID=${accountId}`);

    fs.writeFileSync(envPath, newEnvLines.join('\n'));

    // Update process.env
    process.env.WIX_API_KEY = apiKey;
    process.env.WIX_ACCOUNT_ID = accountId;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error saving Wix configuration:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}