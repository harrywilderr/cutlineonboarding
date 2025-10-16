import fetch from 'node-fetch';

export async function handler(event) {
  const CLIENT_ID = '459917020247-ual4frer6m7gqiuhqdf4a08kfcijpm77.apps.googleusercontent.com';
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET; // Add this in Netlify env vars
  const REDIRECT_URI = 'https://onboarding.cutline.co/.netlify/functions/oauth2-callback';

  // Extract the authorization code from the URL query
  const code = event.queryStringParameters.code;

  if (!code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing authorization code' }),
    };
  }

  try {
    // Exchange the code for access and refresh tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || 'Token exchange failed');
    }

    // You’ll want to store tokenData.access_token and tokenData.refresh_token in your database
    console.log('✅ YouTube Tokens:', tokenData);

    // HTML response that sends message back to opener window and closes popup
    const htmlResponse = `
      <script>
        window.opener.postMessage(
          { platform: 'youtube', status: 'connected' },
          '*'
        );
        window.close();
      </script>
      <p style="font-family: sans-serif; text-align: center;">
        YouTube connected successfully! You can close this window.
      </p>
    `;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: htmlResponse,
    };
  } catch (err) {
    console.error('❌ OAuth error:', err);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}