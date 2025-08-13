import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Row,
  Column,
  Hr,
  Img,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface ShippingNotificationEmailProps {
  order: any;
  storeConfig: Record<string, any>;
}

export const ShippingNotificationEmail = ({
  order,
  storeConfig,
}: ShippingNotificationEmailProps) => {
  const storeName = storeConfig.store_name || 'New Era Herbals';
  const currency = storeConfig.currency || 'PKR';
  const storeEmail = storeConfig.store_email || 'neweraorganic101@gmail.com';
  const storePhone = storeConfig.store_phone || '+92 304 307 3838';

  const formatCurrency = (amount: number) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    return `${address.first_name} ${address.last_name}\n${address.address_line_1}\n${address.address_line_2 ? address.address_line_2 + '\n' : ''}${address.city}, ${address.state} ${address.postal_code || ''}\n${address.country}`;
  };

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7); // Estimate 7 days from now

  return (
    <Html>
      <Head />
      <Preview>Your order #{order.order_number} has been shipped and is on its way!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>{storeName}</Heading>
            <Text style={headerText}>Your order is on its way! 🚚</Text>
          </Section>

          {/* Shipping Summary */}
          <Section style={shippingSummary}>
            <Heading style={h2}>Shipping Notification</Heading>
            <Text style={orderNumber}>Order Number: <strong>#{order.order_number}</strong></Text>
            <Text style={shippingStatus}>
              <strong>Status:</strong> {order.status === 'shipped' ? 'Shipped' : 'Processing'}
            </Text>
            {order.shipped_at && (
              <Text style={shippingDate}>
                <strong>Shipped Date:</strong> {new Date(order.shipped_at).toLocaleDateString()}
              </Text>
            )}
            <Text style={estimatedDate}>
              <strong>Estimated Delivery:</strong> {estimatedDelivery.toLocaleDateString()}
            </Text>
          </Section>

          {/* Shipping Address */}
          <Section>
            <Heading style={h3}>Shipping To</Heading>
            <Text style={addressText}>
              {formatAddress(order.shipping_address)}
            </Text>
          </Section>

          {/* Order Items Summary */}
          <Section>
            <Heading style={h3}>Items in This Shipment</Heading>
            <Hr style={hr} />
            {order.order_items?.map((item: any, index: number) => {
              // Get the best image - prefer variant image, fallback to product image
              const variantImages = item.product_variants?.product_variant_images || [];
              const productImages = item.products?.product_images || [];
              const sortedVariantImages = variantImages.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
              const sortedProductImages = productImages.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
              const bestImage = sortedVariantImages[0]?.image_url || sortedProductImages[0]?.image_url;
              
              return (
                <Row key={index} style={itemRow}>
                  <Column style={imageColumn}>
                    {bestImage && (
                      <Img
                        src={bestImage}
                        alt={item.products?.name || 'Product'}
                        style={productImage}
                      />
                    )}
                  </Column>
                  <Column style={itemColumn}>
                    <Text style={itemName}>
                      {item.products?.name || 'Product'}
                      {item.product_variants?.name && (
                        <span style={variantName}> - {item.product_variants.name}</span>
                      )}
                    </Text>
                    <Text style={itemDetails}>Quantity: {item.quantity}</Text>
                  </Column>
                </Row>
              );
            })}
            <Hr style={hr} />
          </Section>

          {/* Tracking Information */}
          <Section style={trackingSection}>
            <Heading style={h3}>Track Your Package</Heading>
            <Text style={trackingText}>
              We'll send you tracking information as soon as it becomes available. 
              You can also check your order status by visiting our website.
            </Text>
            {/* You can add actual tracking number here when available */}
          </Section>

          {/* What's Next */}
          <Section style={nextStepsSection}>
            <Heading style={h3}>What's Next?</Heading>
            <Text style={nextStepsText}>
              • Your package is being prepared for delivery<br />
              • You'll receive tracking information once available<br />
              • Estimated delivery: {estimatedDelivery.toLocaleDateString()}<br />
              • Contact us if you have any questions
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={hr} />
            <Text style={footerText}>
              If you have any questions about your shipment, please contact us:
            </Text>
            <Text style={contactInfo}>
              Email: <Link href={`mailto:${storeEmail}`} style={link}>{storeEmail}</Link><br />
              Phone: {storePhone}
            </Text>
            <Text style={footerText}>
              Thank you for choosing {storeName}!
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 40px',
  backgroundColor: '#f0f8f0',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#1a202c',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const headerText = {
  color: '#22543d',
  fontSize: '18px',
  margin: '0',
};

const shippingSummary = {
  padding: '24px 40px',
  backgroundColor: '#f0fff4',
  border: '1px solid #9ae6b4',
  borderRadius: '8px',
  margin: '24px 40px',
};

const h2 = {
  color: '#2d3748',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const h3 = {
  color: '#2d3748',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '32px 40px 16px',
};

const orderNumber = {
  fontSize: '16px',
  color: '#4a5568',
  margin: '0 0 8px',
};

const shippingStatus = {
  fontSize: '16px',
  color: '#22543d',
  margin: '0 0 8px',
};

const shippingDate = {
  fontSize: '16px',
  color: '#4a5568',
  margin: '0 0 8px',
};

const estimatedDate = {
  fontSize: '16px',
  color: '#22543d',
  fontWeight: 'bold',
  margin: '0',
};

const addressText = {
  fontSize: '16px',
  color: '#4a5568',
  margin: '0 40px 16px',
  whiteSpace: 'pre-line' as const,
};

const itemRow = {
  padding: '12px 40px',
  borderBottom: '1px solid #f1f5f9',
};

const imageColumn = {
  verticalAlign: 'top' as const,
  width: '80px',
  paddingRight: '12px',
};

const itemColumn = {
  verticalAlign: 'top' as const,
};

const productImage = {
  width: '60px',
  height: '60px',
  objectFit: 'cover' as const,
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
};

const itemName = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#2d3748',
  margin: '0 0 4px',
};

const variantName = {
  fontWeight: 'normal',
  color: '#718096',
};

const itemDetails = {
  fontSize: '14px',
  color: '#718096',
  margin: '0',
};

const trackingSection = {
  padding: '0 40px',
  backgroundColor: '#f7fafc',
  margin: '24px 40px',
  borderRadius: '8px',
  padding: '24px',
};

const trackingText = {
  fontSize: '16px',
  color: '#4a5568',
  margin: '0',
  lineHeight: '1.5',
};

const nextStepsSection = {
  padding: '0 40px',
};

const nextStepsText = {
  fontSize: '16px',
  color: '#4a5568',
  margin: '0',
  lineHeight: '1.6',
};

const footer = {
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '14px',
  color: '#718096',
  margin: '0 0 8px',
};

const contactInfo = {
  fontSize: '14px',
  color: '#4a5568',
  margin: '0 0 16px',
};

const link = {
  color: '#3182ce',
  textDecoration: 'underline',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '20px 0',
};

export default ShippingNotificationEmail;