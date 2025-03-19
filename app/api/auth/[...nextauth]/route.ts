import NextAuth from 'next-auth';
import type { AuthOptions } from 'next-auth';
import FacebookProvider from 'next-auth/providers/facebook';
import LinkedInProvider from 'next-auth/providers/linkedin';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: AuthOptions = {
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID || '',
      clientSecret: process.env.FACEBOOK_SECRET || '',
      authorization: {
        params: {
          scope: 'email,public_profile,publish_to_groups'
        }
      }
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_ID || '',
      clientSecret: process.env.LINKEDIN_SECRET || '',
      authorization: {
        params: {
          scope: 'r_liteprofile r_emailaddress w_member_social'
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || '',
      authorization: {
        params: {
          scope: 'openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/webmasters.readonly',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      },
      checks: ['state', 'pkce'],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture
        };
      }
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (!account || !profile) {
        console.error('SignIn failed: Missing account or profile data');
        return false;
      }

      // Validate required credentials
      if (!process.env.NEXTAUTH_SECRET) {
        console.error('SignIn failed: Missing NEXTAUTH_SECRET environment variable');
        return false;
      }

      // Log successful authentication
      console.log('Authentication successful for provider:', account.provider);
      console.log('Profile data received:', { email: profile.email, name: profile.name });
      
      return true;
    },
    async jwt({ token, account, user }) {
      if (account) {
        console.log('Setting JWT token with account data:', {
          provider: account.provider,
          accessToken: account.access_token ? 'Present' : 'Missing',
          refreshToken: account.refresh_token ? 'Present' : 'Missing'
        });
        
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
        token.id = account.providerAccountId;
        token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : null;
      } else if (token.accessTokenExpires && typeof token.accessTokenExpires === 'number') {
        // Check if the token is expired
        if (Date.now() >= token.accessTokenExpires) {
          try {
            // If we have a refresh token, attempt to refresh the access token
            if (token.refreshToken && process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) {
              const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                  client_id: process.env.GOOGLE_ID,
                  client_secret: process.env.GOOGLE_SECRET,
                  grant_type: 'refresh_token',
                  refresh_token: token.refreshToken as string,
                }),
              });

              const tokens = await response.json();

              if (!response.ok) throw tokens;

              console.log('Successfully refreshed access token');
              
              return {
                ...token,
                accessToken: tokens.access_token,
                accessTokenExpires: Date.now() + (tokens.expires_in * 1000),
              };
            }
          } catch (error) {
            console.error('Error refreshing access token:', error);
            return { ...token, error: 'RefreshAccessTokenError' };
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        console.log('Setting session data with token:', {
          provider: token.provider,
          accessToken: token.accessToken ? 'Present' : 'Missing',
          error: token.error || 'None'
        });
        
        if (token.error) {
          session.error = token.error;
        }
        
        session.accessToken = token.accessToken;
        session.provider = token.provider;
        session.user = {
          ...session.user,
          id: token.id
        };
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    error: '/auth/error',
    signIn: '/',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };