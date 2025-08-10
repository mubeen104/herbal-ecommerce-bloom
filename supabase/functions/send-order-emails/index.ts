import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { OrderConfirmationEmail } from './_templates/order-confirmation.tsx';
import { ShippingNotificationEmail } from './_templates/shipping-notification.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface EmailRequest {
  type: 'order_confirmation' | 'shipping_notification';
  orderId: string;
  recipientEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, orderId, recipientEmail }: EmailRequest = await req.json();

    console.log(`Processing ${type} email for order ${orderId}`);

    // Get email and store settings in one query
    const { data: allSettings } = await supabase
      .from('settings')
      .select('key, value, category')
      .in('category', ['store', 'email']);

    const settings: Record<string, any> = {};
    allSettings?.forEach(setting => {
      try {
        settings[setting.key] = typeof setting.value === 'string' 
          ? JSON.parse(setting.value) 
          : setting.value;
      } catch (e) {
        // If JSON parsing fails, use the raw value
        settings[setting.key] = setting.value;
      }
    });

    console.log('Retrieved settings:', settings);

    // Check if this email type is enabled
    if (type === 'order_confirmation' && !settings.order_confirmation_emails) {
      console.log('Order confirmation emails are disabled');
      return new Response(JSON.stringify({ message: 'Order confirmation emails are disabled' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (type === 'shipping_notification' && !settings.shipping_notification_emails) {
      console.log('Shipping notification emails are disabled');
      return new Response(JSON.stringify({ message: 'Shipping notification emails are disabled' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get order details with related data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            images:product_images(image_url)
          ),
          product_variants (
            name
          )
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderError?.message}`);
    }

    let emailHtml: string;
    let subject: string;
    let toEmail: string;

    // Determine recipient email with better fallback logic
    if (recipientEmail) {
      toEmail = recipientEmail;
    } else if (order.user_id) {
      // Get user's email from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('user_id', order.user_id)
        .single();
      
      toEmail = profile?.email || '';
    } else {
      // For guest orders, try to get email from shipping or billing address
      toEmail = order.shipping_address?.email || order.billing_address?.email || '';
    }

    if (!toEmail) {
      throw new Error('No recipient email found for order. Please provide recipientEmail parameter.');
    }

    console.log(`Sending ${type} email to: ${toEmail}`);

    // Determine sender settings
    const fromEmail = settings.from_email || 'noreply@neweraherbals.com';
    const storeName = settings.store_name || 'New Era Herbals';

    // Generate email content based on type
    if (type === 'order_confirmation') {
      emailHtml = await renderAsync(
        React.createElement(OrderConfirmationEmail, {
          order,
          storeConfig: settings
        })
      );
      subject = `Order Confirmation - ${order.order_number}`;
    } else if (type === 'shipping_notification') {
      emailHtml = await renderAsync(
        React.createElement(ShippingNotificationEmail, {
          order,
          storeConfig: settings
        })
      );
      subject = `Your Order Has Shipped - ${order.order_number}`;
    } else {
      throw new Error('Invalid email type');
    }

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: `${storeName} <${fromEmail}>`,
      to: [toEmail],
      subject,
      html: emailHtml,
    });

    if (emailResponse.error) {
      console.error('Failed to send email:', emailResponse.error);
      throw emailResponse.error;
    }

    console.log(`${type} email sent successfully:`, {
      emailId: emailResponse.data?.id,
      recipient: toEmail
    });

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      recipient: toEmail,
      message: `${type} email sent successfully`
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-order-emails function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);