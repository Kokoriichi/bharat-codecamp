import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { code, language } = await req.json();

    // Language ID mapping for Judge0
    const languageIds: Record<string, number> = {
      python: 71,
      javascript: 63,
      cpp: 54,
      java: 62,
      c: 50,
      csharp: 51,
      ruby: 72,
      go: 60,
      rust: 73,
      php: 68,
      swift: 83,
      kotlin: 78,
    };

    const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': Deno.env.get('JUDGE0_API_KEY') || '',
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
      body: JSON.stringify({
        source_code: code,
        language_id: languageIds[language] || 71,
      }),
    });

    const result = await response.json();

    return new Response(
      JSON.stringify({
        output: result.stdout || result.stderr || result.compile_output || 'No output',
        error: result.status?.description !== 'Accepted' ? result.stderr : null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
