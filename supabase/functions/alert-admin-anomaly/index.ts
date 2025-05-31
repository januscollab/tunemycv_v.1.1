
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnomalyAlert {
  type: string;
  originalScore: number;
  calculatedScore: number;
  difference: number;
  userId: string;
  analysisId: string;
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const alertData: AnomalyAlert = await req.json();

    const emailBody = `
      <h2>Score Anomaly Detected - TuneMyCV</h2>
      <p><strong>Alert Type:</strong> ${alertData.type}</p>
      <p><strong>User ID:</strong> ${alertData.userId}</p>
      <p><strong>Analysis ID:</strong> ${alertData.analysisId}</p>
      <p><strong>Original Score:</strong> ${alertData.originalScore}%</p>
      <p><strong>Calculated Score:</strong> ${alertData.calculatedScore}%</p>
      <p><strong>Difference:</strong> ${alertData.difference} points</p>
      <p><strong>Timestamp:</strong> ${alertData.timestamp}</p>
      
      <hr>
      <p>This anomaly was automatically detected and the score was corrected using fallback calculation.</p>
      <p>Please investigate the AI response quality and consider prompt adjustments if this becomes frequent.</p>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TuneMyCV Alerts <alerts@tunemycv.com>',
        to: ['admin@tunemycv.com'],
        subject: `Score Anomaly Alert - Analysis ${alertData.analysisId}`,
        html: emailBody,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.status}`);
    }

    console.log('Admin alert sent successfully for anomaly:', alertData.analysisId);

    return new Response(
      JSON.stringify({ success: true, message: 'Admin alert sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending admin alert:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
