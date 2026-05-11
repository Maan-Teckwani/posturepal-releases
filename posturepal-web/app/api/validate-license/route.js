import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function POST(req) {
  const { key } = await req.json();

  const { data, error } = await supabase
    .from('licenses')
    .select('*')
    .eq('key', key.toUpperCase().trim())
    .single();

  if (error || !data) {
    return Response.json({ valid: false, message: 'Invalid license key.' });
  }

  if (data.device_count >= 2) {
    return Response.json({ valid: false, message: 'License already used on 2 devices.' });
  }

  // Increment device count
  await supabase
    .from('licenses')
    .update({ device_count: data.device_count + 1 })
    .eq('key', key);

  return Response.json({ valid: true, message: 'License activated.' });
}
