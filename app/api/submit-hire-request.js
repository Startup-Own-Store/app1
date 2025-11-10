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

const COOLDOWN_MINUTES = Number.parseInt(process.env.HIRE_REQUEST_COOLDOWN_MINUTES || '5', 10) || 0;

const sanitizeString = (value) => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const formatRemaining = (msRemaining) => {
  if (msRemaining <= 0) {
    return 'a few moments';
  }

  const totalSeconds = Math.ceil(msRemaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }

  return `${seconds}s`;
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
      created_at: new Date().toISOString(),
    };

    if (!insertPayload.service_category) {
      insertPayload.service_category = 'Other';
    }

    if (COOLDOWN_MINUTES > 0) {
      const cooldownMilliseconds = COOLDOWN_MINUTES * 60 * 1000;
      const cutoffIso = new Date(Date.now() - cooldownMilliseconds).toISOString();

      const { data: recentSubmissions, error: recentError } = await supabaseClient
        .from('user_hire_requests')
        .select('id, created_at')
        .eq('user_id', insertPayload.user_id)
        .eq('service_category', insertPayload.service_category)
        .gte('created_at', cutoffIso)
        .order('created_at', { ascending: false })
        .limit(1);

      if (recentError) {
        console.error('❌ Failed to evaluate hire request cooldown:', recentError);
        return res.status(500).json({
          error: 'Failed to submit request',
          details: 'Unable to validate submission cooldown. Please try again shortly.',
        });
      }

      if (Array.isArray(recentSubmissions) && recentSubmissions.length > 0) {
        const lastCreatedAt = recentSubmissions[0]?.created_at;
        const lastTimestamp = lastCreatedAt ? Date.parse(lastCreatedAt) : NaN;

        if (!Number.isNaN(lastTimestamp)) {
          const elapsed = Date.now() - lastTimestamp;
          const remaining = Math.max(0, cooldownMilliseconds - elapsed);

          if (remaining > 0) {
            return res.status(429).json({
              error: 'Please wait',
              details: `You recently submitted a request to hire a ${insertPayload.service_category}. Please wait ${formatRemaining(
                remaining
              )} before submitting another for the same service.`,
            });
          }
        }
      }
    }

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
