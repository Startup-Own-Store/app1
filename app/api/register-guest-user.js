const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseClient = null;

if (supabaseUrl && supabaseServiceKey) {
  supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
} else {
  console.warn(
    '⚠️  Supabase credentials missing: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Guest user registration will fail.'
  );
}

const sanitize = (value) => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const generateGuestEmail = () => {
  const random = crypto.randomUUID().slice(0, 12);
  return `guest-${Date.now()}-${random}@ownstore.app`;
};

module.exports = async function registerGuestUser(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseClient) {
    return res.status(500).json({
      error: 'Server is not configured for Supabase operations',
      details: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables',
    });
  }

  try {
    const { existingUserId, name, phone } = req.body || {};
    const displayName = sanitize(name) || 'OwnStore Guest';
    const normalizedPhone = sanitize(phone);

    if (existingUserId) {
      try {
        const { data, error } = await supabaseClient.auth.admin.getUserById(existingUserId);
        if (!error && data?.user?.id) {
          return res.status(200).json({ userId: data.user.id, created: false });
        }
      } catch (lookupError) {
        console.warn('⚠️  Unable to verify existing Supabase user:', lookupError.message);
      }
    }

    const userMetadata = {
      name: displayName,
      phone: normalizedPhone,
      source: 'guest_hire_request',
    };

    let createResult = await supabaseClient.auth.admin.createUser({
      email: generateGuestEmail(),
      email_confirm: true,
      phone: normalizedPhone,
      phone_confirm: Boolean(normalizedPhone),
      user_metadata: userMetadata,
    });

    if (createResult.error && normalizedPhone) {
      const phoneError = createResult.error.message || '';
      const duplicatePhone = phoneError.includes('duplicate key value') || phoneError.includes('users_phone_key');
      if (duplicatePhone) {
        console.warn('⚠️  Phone already in use, creating guest user without phone association');
        createResult = await supabaseClient.auth.admin.createUser({
          email: generateGuestEmail(),
          email_confirm: true,
          user_metadata: userMetadata,
        });
      }
    }

    if (createResult.error) {
      return res.status(400).json({
        error: 'Failed to create guest user',
        details: createResult.error.message,
      });
    }

    const userId = createResult.data?.user?.id;
    if (!userId) {
      return res.status(500).json({
        error: 'Supabase did not return a user id',
      });
    }

    return res.status(200).json({ userId, created: true });
  } catch (error) {
    console.error('❌ Guest user registration error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
};
