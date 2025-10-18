const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Simplified token verification - just decode the JWT payload
 * In production, you should use Firebase Admin SDK for proper verification
 */
function decodeFirebaseIdToken(idToken) {
  if (!idToken) {
    return null;
  }
  
  try {
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }
    
    // Decode the payload (second part)
    const payload = parts[1];
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decoded = JSON.parse(Buffer.from(paddedPayload, 'base64').toString());
    
    // Basic validation
    if (!decoded.sub || !decoded.aud) {
      console.error('Token missing required fields');
      return null;
    }
    
    // Check if token is expired
    if (decoded.exp && Date.now() / 1000 > decoded.exp) {
      console.error('Token expired');
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
}

/**
 * Express route handler to sync Firebase user to Supabase
 */
async function syncFirebaseUser(req, res) {
  console.log('🚀 Starting syncFirebaseUser function');
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight request');
    return res.status(200).send('OK');
  }

  // Only accept POST
  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    return res.status(405).json({ error: 'Only POST method allowed' });
  }

  try {
    const { idToken, metadata, role } = req.body;

    console.log('📨 Received sync request');
    console.log('📝 Metadata:', metadata);
    console.log('👤 Role:', role || 'user (default)');
    console.log('🔑 IdToken present:', !!idToken);
    console.log('🔑 IdToken length:', idToken ? idToken.length : 0);

    // Validate request
    if (!idToken) {
      console.error('❌ Missing idToken');
      return res.status(400).json({ error: 'Missing idToken in request body' });
    }

    // Decode Firebase ID token
    console.log('🔐 Decoding Firebase token...');
    const tokenInfo = decodeFirebaseIdToken(idToken);

    if (!tokenInfo || !tokenInfo.sub) {
      console.error('❌ Token decode failed');
      return res.status(401).json({ error: 'Invalid or expired Firebase ID token' });
    }

    console.log('✅ Token decoded for UID:', tokenInfo.sub);

    // Prepare user data for upsert
    const userData = {
      firebase_uid: tokenInfo.sub,
      display_name: metadata?.displayName || tokenInfo.name || null,
      email: metadata?.email || tokenInfo.email || null,
      phone_number: metadata?.phoneNumber || tokenInfo.phone_number || null,
      photo_url: metadata?.photoURL || tokenInfo.picture || null,
      providers: metadata?.providers ? JSON.stringify(metadata.providers) : null,
      role: role || 'user', // Use role from request or default to 'user'
      last_login: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('Upserting user data:', { firebase_uid: userData.firebase_uid });
    console.log('📊 Full user data:', userData);
    console.log('🔗 Supabase URL:', supabaseUrl);
    console.log('🔑 Service key present:', !!supabaseServiceKey);

    // Upsert into firebase_users table
    const { data, error } = await supabase
      .from('firebase_users')
      .upsert(userData, {
        onConflict: 'firebase_uid',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Database upsert error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      
      // Check if it's a table/column issue
      if (error.code === '42P01') {
        return res.status(500).json({ 
          error: 'Database table not found', 
          details: 'The users table does not exist. Please run the migration.' 
        });
      }
      
      if (error.code === '42703') {
        return res.status(500).json({ 
          error: 'Database column not found', 
          details: 'One or more columns do not exist in the users table.' 
        });
      }
      
      return res.status(500).json({ 
        error: 'Database upsert failed', 
        details: error.message,
        code: error.code
      });
    }

    console.log('✅ User synced successfully:', data);

    return res.status(200).json({ 
      status: 'ok', 
      message: 'User synced successfully',
      user: data 
    });

  } catch (error) {
    console.error('❌ Function error:', error);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

module.exports = syncFirebaseUser;
