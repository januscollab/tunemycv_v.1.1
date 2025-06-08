import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UsageAlertRequest {
  threshold: number;
  currentUsage: number;
  monthlyLimit: number;
  usagePercentage: number;
  daysUntilReset: number;
  resetDate: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const requestBody: UsageAlertRequest = await req.json();
    const { threshold, currentUsage, monthlyLimit, usagePercentage, daysUntilReset, resetDate } = requestBody;

    // Get admin email from site settings
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('admin_email')
      .single();

    if (settingsError || !settings?.admin_email) {
      throw new Error('Admin email not configured in site settings');
    }

    // Initialize Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    if (!resend) {
      throw new Error('Resend API key not configured');
    }

    // Determine alert level and styling
    const getAlertLevel = (threshold: number) => {
      if (threshold >= 100) return { level: 'Critical', color: '#dc2626', icon: '🚨' };
      if (threshold >= 90) return { level: 'Critical', color: '#dc2626', icon: '⚠️' };
      if (threshold >= 80) return { level: 'High', color: '#ea580c', icon: '⚠️' };
      return { level: 'Moderate', color: '#ca8a04', icon: '📊' };
    };

    const alertInfo = getAlertLevel(threshold);
    const currentMonth = new Date().toISOString().substring(0, 7);

    // Create email content
    const emailSubject = `${alertInfo.icon} Adobe PDF Services Usage Alert - ${threshold}% Limit Reached`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Adobe PDF Services Usage Alert</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
            .header { background: ${alertInfo.color}; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; }
            .usage-stats { background: #f3f4f6; border-radius: 6px; padding: 20px; margin: 20px 0; }
            .stat-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .stat-label { font-weight: 600; color: #374151; }
            .stat-value { color: #1f2937; }
            .progress-bar { width: 100%; height: 20px; background: #e5e7eb; border-radius: 10px; overflow: hidden; margin: 15px 0; }
            .progress-fill { height: 100%; background: ${alertInfo.color}; transition: width 0.3s ease; }
            .footer { background: #f9fafb; padding: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
            .btn { display: inline-block; background: ${alertInfo.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
            .alert-critical { border-left: 4px solid #dc2626; background: #fef2f2; padding: 15px; margin: 20px 0; }
            .alert-high { border-left: 4px solid #ea580c; background: #fff7ed; padding: 15px; margin: 20px 0; }
            .alert-moderate { border-left: 4px solid #ca8a04; background: #fffbeb; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${alertInfo.icon} Adobe PDF Services Usage Alert</h1>
              <p>Your monthly usage has reached ${threshold}% of the limit</p>
            </div>
            
            <div class="content">
              <div class="alert-${threshold >= 90 ? 'critical' : threshold >= 80 ? 'high' : 'moderate'}">
                <strong>${alertInfo.level} Usage Alert</strong><br>
                Your Adobe PDF Services API usage has reached ${usagePercentage.toFixed(1)}% of your monthly limit.
                ${threshold >= 100 ? ' <strong>No more extractions can be performed until the reset.</strong>' : ''}
              </div>

              <div class="usage-stats">
                <h3>Current Usage Statistics</h3>
                
                <div class="stat-row">
                  <span class="stat-label">Current Usage:</span>
                  <span class="stat-value">${currentUsage} / ${monthlyLimit} extractions</span>
                </div>
                
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${Math.min(usagePercentage, 100)}%"></div>
                </div>
                
                <div class="stat-row">
                  <span class="stat-label">Usage Percentage:</span>
                  <span class="stat-value">${usagePercentage.toFixed(1)}%</span>
                </div>
                
                <div class="stat-row">
                  <span class="stat-label">Days Until Reset:</span>
                  <span class="stat-value">${daysUntilReset} days</span>
                </div>
                
                <div class="stat-row">
                  <span class="stat-label">Reset Date:</span>
                  <span class="stat-value">${new Date(resetDate).toLocaleDateString()}</span>
                </div>
                
                <div class="stat-row">
                  <span class="stat-label">Alert Level:</span>
                  <span class="stat-value" style="color: ${alertInfo.color}; font-weight: 600;">${alertInfo.level}</span>
                </div>
              </div>

              <h3>Recommended Actions</h3>
              <ul>
                ${threshold >= 100 ? 
                  '<li><strong>Immediate:</strong> No more PDF extractions can be performed until the monthly reset.</li>' : 
                  '<li>Monitor usage closely to avoid hitting the monthly limit.</li>'
                }
                <li>Consider increasing the monthly limit if needed.</li>
                <li>Review extraction patterns and optimize usage if possible.</li>
                <li>Check the admin panel for detailed usage analytics.</li>
              </ul>

              <p style="text-align: center; margin: 30px 0;">
                <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.co')}/admin" class="btn">
                  View Admin Panel
                </a>
              </p>
            </div>

            <div class="footer">
              <p><strong>Adobe PDF Services Usage Monitoring</strong></p>
              <p>This alert was automatically generated when your API usage reached ${threshold}% of the monthly limit.</p>
              <p>Month: ${currentMonth} | Generated: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Adobe Usage Monitor <noreply@yourdomain.com>",
      to: [settings.admin_email],
      subject: emailSubject,
      html: emailHtml,
    });

    // Record that alert was sent
    const { error: insertError } = await supabase
      .from('usage_alerts_sent')
      .insert({
        month_year: currentMonth,
        threshold_percentage: threshold
      });

    if (insertError) {
      console.error('Failed to record alert sent:', insertError);
    }

    console.log(`Usage alert sent for ${threshold}% threshold to ${settings.admin_email}`);

    return new Response(JSON.stringify({
      success: true,
      emailId: emailResponse.data?.id,
      threshold,
      adminEmail: settings.admin_email
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error sending usage alert:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);