const { createClient } = require('@supabase/supabase-js');

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
    '⚠️  Supabase credentials missing: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Hire request submission will fail.'
  );
}

const sanitizeString = (value) => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

module.exports = async function submitHireRequest(req, res) {
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
    const {
      userId,
      serviceName,
      serviceCategory,
      isConsultancy = false,
      isCustomRequest = false,
      fullName,
      phoneNumber,
      addressType,
      addressLine,
      jobDescription,
      imageUrls,
    } = req.body || {};

    const requiredFields = [];
    if (!sanitizeString(userId)) requiredFields.push('userId');
    if (!sanitizeString(serviceName)) requiredFields.push('serviceName');
    if (!sanitizeString(fullName)) requiredFields.push('fullName');
    if (!sanitizeString(phoneNumber)) requiredFields.push('phoneNumber');
    if (!sanitizeString(addressLine)) requiredFields.push('addressLine');

    if (requiredFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: `Provide: ${requiredFields.join(', ')}`,
      });
    }

    const normalizedImages = Array.isArray(imageUrls)
      ? imageUrls.filter((uri) => typeof uri === 'string' && uri.trim().length > 0)
      : [];

    const insertPayload = {
      user_id: sanitizeString(userId),
      service_name: sanitizeString(serviceName),
      service_category: sanitizeString(serviceCategory) || sanitizeString(serviceName),
      is_consultancy: Boolean(isConsultancy),
      is_custom_request: Boolean(isCustomRequest),
      full_name: sanitizeString(fullName),
      phone_number: sanitizeString(phoneNumber),
      address_type: sanitizeString(addressType) || 'Other',
      address_line: sanitizeString(addressLine),
      job_description: sanitizeString(jobDescription) || null,
      image_urls: normalizedImages,
      status: 'pending',
    };

    const { data, error } = await supabaseClient
      .from('user_hire_requests')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to insert hire request:', error);
      return res.status(500).json({
        error: 'Failed to submit request',
        details: error.message,
      });
    }

    return res.status(200).json({ data });
  } catch (error) {
    console.error('❌ Unexpected error submitting hire request:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
};
