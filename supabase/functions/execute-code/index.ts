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

    // Use Piston API which has better library support
    const languageMap: Record<string, string> = {
      python: 'python',
      javascript: 'javascript',
      cpp: 'c++',
      java: 'java',
      c: 'c',
      csharp: 'csharp',
      ruby: 'ruby',
      go: 'go',
      rust: 'rust',
      php: 'php',
      swift: 'swift',
      kotlin: 'kotlin',
      typescript: 'typescript',
    };

    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: languageMap[language] || 'python',
        version: '*',
        files: [{
          name: 'main',
          content: code,
        }],
      }),
    });

    const result = await response.json();

    const output = result.run?.output || result.compile?.output || 'No output';
    const error = result.run?.stderr || result.compile?.stderr || null;

    return new Response(
      JSON.stringify({
        output: output,
        error: error,
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
