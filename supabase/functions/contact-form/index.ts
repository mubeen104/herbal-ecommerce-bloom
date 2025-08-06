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

interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, message }: ContactRequest = await req.json();

    if (!name || !email || !message) {
      throw new Error('Name, email, and message are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    console.log(`Processing contact form submission from: ${email}`);

    // Get store settings
    const { data: storeSettings } = await supabase
      .from('settings')
      .select('key, value')
      .eq('category', 'store');

    const storeConfig: Record<string, any> = {};
    storeSettings?.forEach(setting => {
      storeConfig[setting.key] = setting.value;
    });

    // Store contact submission in database
    const { error: insertError } = await supabase
      .from('contact_submissions')
      .insert([{
        name,
        email,
        phone: phone || null,
        message,
        submitted_at: new Date().toISOString(),
        status: 'new'
      }]);

    if (insertError) {
      console.error('Error storing contact submission:', insertError);
    }

    // Send notification email to store admin
    const adminNotificationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef3f2;">
        <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 25px; border-radius: 12px; text-align: center; margin-bottom: 25px;">
          <h1 style="color: white; font-size: 28px; margin: 0;">📬 New Contact Form Submission</h1>
          <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 10px 0 0 0;">
            ${storeConfig.store_name || 'New Era Herbals'}
          </p>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h2 style="color: #dc2626; font-size: 22px; margin-bottom: 20px;">Contact Details</h2>
          
          <div style="margin-bottom: 15px; padding: 15px; background: #f9fafb; border-radius: 8px;">
            <strong style="color: #374151;">Name:</strong> ${name}
          </div>
          
          <div style="margin-bottom: 15px; padding: 15px; background: #f9fafb; border-radius: 8px;">
            <strong style="color: #374151;">Email:</strong> 
            <a href="mailto:${email}" style="color: #dc2626; text-decoration: none;">${email}</a>
          </div>
          
          ${phone ? `
          <div style="margin-bottom: 15px; padding: 15px; background: #f9fafb; border-radius: 8px;">
            <strong style="color: #374151;">Phone:</strong> 
            <a href="tel:${phone}" style="color: #dc2626; text-decoration: none;">${phone}</a>
          </div>
          ` : ''}
          
          <div style="margin-bottom: 20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
            <strong style="color: #374151;">Message:</strong><br>
            <div style="margin-top: 10px; color: #4b5563; line-height: 1.6; white-space: pre-wrap;">${message}</div>
          </div>
          
          <div style="text-align: center; margin-top: 25px;">
            <a href="mailto:${email}?subject=Re: Your inquiry to ${storeConfig.store_name || 'New Era Herbals'}" 
               style="background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 12px 25px; border-radius: 20px; text-decoration: none; font-size: 16px; font-weight: 600; display: inline-block;">
              📧 Reply to Customer
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
          <p>This notification was sent from your ${storeConfig.store_name || 'New Era Herbals'} contact form</p>
        </div>
      </div>
    `;

    // Send confirmation email to customer
    const customerConfirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0fdf4;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 25px; border-radius: 12px; text-align: center; margin-bottom: 25px;">
          <h1 style="color: white; font-size: 28px; margin: 0;">Thank you, ${name}!</h1>
          <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 10px 0 0 0;">
            We've received your message
          </p>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h2 style="color: #059669; font-size: 22px; margin-bottom: 20px;">Your Message Has Been Received</h2>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Thank you for contacting ${storeConfig.store_name || 'New Era Herbals'}! We've received your message and our team will get back to you within 24 hours during business days.
          </p>
          
          <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #065f46; font-size: 18px; margin: 0 0 10px 0;">📝 Your Message:</h3>
            <p style="color: #065f46; font-size: 14px; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="text-align: center; margin-top: 25px;">
            <a href="${storeConfig.website_url || 'https://neweraherbals.com'}" 
               style="background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 12px 25px; border-radius: 20px; text-decoration: none; font-size: 16px; font-weight: 600; display: inline-block;">
              🌿 Visit Our Store
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
          <p>Need immediate assistance? Call us at ${storeConfig.store_phone || '(555) 123-4567'}</p>
          <div style="margin-top: 10px;">
            <a href="https://www.instagram.com/neweraherbal/" style="color: #059669; margin: 0 8px; text-decoration: none;">Instagram</a>
            <a href="https://www.facebook.com/new.era.151908" style="color: #059669; margin: 0 8px; text-decoration: none;">Facebook</a>
            <a href="https://www.tiktok.com/@new.era7904" style="color: #059669; margin: 0 8px; text-decoration: none;">TikTok</a>
          </div>
        </div>
      </div>
    `;

    // Send emails in parallel
    const [adminEmailResponse, customerEmailResponse] = await Promise.allSettled([
      resend.emails.send({
        from: `${storeConfig.store_name || 'New Era Herbals'} Contact Form <onboarding@resend.dev>`,
        to: [storeConfig.store_email || 'admin@neweraherbals.com'],
        subject: `New Contact Form Submission from ${name}`,
        html: adminNotificationHtml,
      }),
      resend.emails.send({
        from: `${storeConfig.store_name || 'New Era Herbals'} <onboarding@resend.dev>`,
        to: [email],
        subject: `Thank you for contacting ${storeConfig.store_name || 'New Era Herbals'}!`,
        html: customerConfirmationHtml,
      })
    ]);

    console.log('Contact form emails sent:', {
      admin: adminEmailResponse.status,
      customer: customerEmailResponse.status
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Message sent successfully! We\'ll get back to you within 24 hours.'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in contact-form function:', error);
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