import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface NewsletterRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: NewsletterRequest = await req.json();

    if (!email) {
      throw new Error('Email is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    console.log(`Processing newsletter signup for: ${email}`);

    // Get store settings
    const { data: storeSettings } = await supabase
      .from('settings')
      .select('key, value')
      .eq('category', 'store');

    const storeConfig: Record<string, any> = {};
    storeSettings?.forEach(setting => {
      storeConfig[setting.key] = setting.value;
    });

    // Store email in newsletter table (create if doesn't exist)
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert([{ 
        email,
        subscribed_at: new Date().toISOString(),
        is_active: true
      }])
      .select()
      .single();

    // If email already exists, that's okay
    if (insertError && !insertError.message.includes('duplicate')) {
      console.error('Error storing newsletter subscription:', insertError);
    }

    // Send welcome email
    const welcomeEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fdf8;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; font-size: 32px; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            Welcome to ${storeConfig.store_name || 'New Era Herbals'}!
          </h1>
          <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 15px 0 0 0;">
            🌿 Your journey to natural wellness begins now
          </p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <h2 style="color: #059669; font-size: 24px; margin-bottom: 20px;">Thank you for joining our community!</h2>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            You've successfully subscribed to our newsletter. Get ready to receive:
          </p>
          
          <ul style="color: #374151; font-size: 16px; line-height: 1.8; margin-bottom: 25px; padding-left: 20px;">
            <li>🌱 Weekly herbal wellness tips and remedies</li>
            <li>🎯 Exclusive discounts and special offers</li>
            <li>📦 New product announcements</li>
            <li>🔬 Educational content about natural health</li>
          </ul>
          
          <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="color: #065f46; font-size: 16px; margin: 0; font-weight: 500;">
              💡 Pro Tip: Add our email to your contacts to ensure our newsletters reach your inbox!
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${storeConfig.website_url || 'https://neweraherbals.com'}" 
               style="background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-size: 16px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);">
              🛍️ Start Shopping
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
          <p>Follow us on social media for daily wellness tips!</p>
          <div style="margin-top: 15px;">
            <a href="https://www.instagram.com/neweraherbal/" style="color: #059669; margin: 0 10px; text-decoration: none;">📸 Instagram</a>
            <a href="https://www.facebook.com/new.era.151908" style="color: #059669; margin: 0 10px; text-decoration: none;">📘 Facebook</a>
            <a href="https://www.tiktok.com/@new.era7904" style="color: #059669; margin: 0 10px; text-decoration: none;">🎵 TikTok</a>
          </div>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: `${storeConfig.store_name || 'New Era Herbals'} <onboarding@resend.dev>`,
      to: [email],
      subject: `Welcome to ${storeConfig.store_name || 'New Era Herbals'} Newsletter! 🌿`,
      html: welcomeEmailHtml,
    });

    if (emailResponse.error) {
      console.error('Failed to send welcome email:', emailResponse.error);
      // Don't fail the subscription if email fails
    }

    console.log('Newsletter signup successful:', emailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Successfully subscribed to newsletter!',
      emailId: emailResponse.data?.id
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in newsletter-signup function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);