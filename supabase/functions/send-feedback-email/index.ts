
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: FeedbackEmailRequest = await req.json();

    // Send email to TuneMyCV team
    const emailResponse = await resend.emails.send({
      from: "TuneMyCV Feedback <onboarding@resend.dev>",
      to: ["hello@tunemycv.com"],
      subject: `[Beta Feedback] ${subject}`,
      html: `
        <h2>New Feedback from TuneMyCV Beta User</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <h3>Message:</h3>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This feedback was submitted through the TuneMyCV beta feedback form.
          Reply directly to this email to respond to the user.
        </p>
      `,
      replyTo: email,
    });

    // Send confirmation email to user
    await resend.emails.send({
      from: "TuneMyCV <onboarding@resend.dev>",
      to: [email],
      subject: "Thank you for your feedback!",
      html: `
        <h2>Thank you for your feedback, ${name}!</h2>
        <p>We've received your message about: <strong>${subject}</strong></p>
        <p>Our team will review your feedback and get back to you as soon as possible.</p>
        <p>As we're in beta, your input is incredibly valuable in helping us improve TuneMyCV.</p>
        <p>Best regards,<br>The TuneMyCV Team</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          If you have any urgent questions, feel free to email us directly at hello@tunemycv.com
        </p>
      `,
    });

    console.log("Feedback email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-feedback-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
