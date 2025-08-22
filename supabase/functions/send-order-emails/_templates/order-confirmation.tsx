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
  Img,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface OrderConfirmationEmailProps {
  order: any;
  storeConfig: Record<string, any>;
}

export const OrderConfirmationEmail = ({
  order,
  storeConfig,
}: OrderConfirmationEmailProps) => {
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

  return (
    <Html>
      <Head />
      <Preview>Your order #{order.order_number} has been confirmed</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <div style={headerPattern}></div>
            <div style={brandLogo}>🌿</div>
            <Heading style={h1}>{storeName}</Heading>
            <Text style={headerText}>Thank you for your order! 🎉</Text>
          </Section>

          {/* Order Summary */}
          <Section style={orderSummary}>
            <Heading style={h2}>Order Confirmation</Heading>
            <Text style={orderNumber}>Order Number: <strong>#{order.order_number}</strong></Text>
            <Text style={orderDate}>
              Order Date: {new Date(order.created_at).toLocaleDateString()}
            </Text>
          </Section>

          {/* Order Items */}
          <Section>
            <Heading style={h3}>Order Items</Heading>
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
                    <Text style={itemDetails}>
                      Quantity: {item.quantity} × {formatCurrency(item.price)}
                    </Text>
                  </Column>
                  <Column style={priceColumn}>
                    <Text style={itemTotal}>{formatCurrency(item.total)}</Text>
                  </Column>
                </Row>
              );
            })}
            <Hr style={hr} />
          </Section>

          {/* Order Totals */}
          <Section style={totalsSection}>
            <Row style={totalRow}>
              <Column><Text style={totalLabel}>Subtotal:</Text></Column>
              <Column><Text style={totalValue}>{formatCurrency(order.subtotal)}</Text></Column>
            </Row>
            {order.shipping_amount > 0 && (
              <Row style={totalRow}>
                <Column><Text style={totalLabel}>Shipping:</Text></Column>
                <Column><Text style={totalValue}>{formatCurrency(order.shipping_amount)}</Text></Column>
              </Row>
            )}
            {order.tax_amount > 0 && (
              <Row style={totalRow}>
                <Column><Text style={totalLabel}>Tax:</Text></Column>
                <Column><Text style={totalValue}>{formatCurrency(order.tax_amount)}</Text></Column>
              </Row>
            )}
            {order.discount_amount > 0 && (
              <Row style={totalRow}>
                <Column><Text style={totalLabel}>Discount:</Text></Column>
                <Column><Text style={totalValue}>-{formatCurrency(order.discount_amount)}</Text></Column>
              </Row>
            )}
            <Hr style={hr} />
            <Row style={totalRow}>
              <Column><Text style={grandTotalLabel}>Total:</Text></Column>
              <Column><Text style={grandTotalValue}>{formatCurrency(order.total_amount)}</Text></Column>
            </Row>
          </Section>

          {/* Shipping Information */}
          <Section>
            <Heading style={h3}>Shipping Information</Heading>
            <Text style={addressText}>
              {formatAddress(order.shipping_address)}
            </Text>
            <Text style={shippingNote}>
              <strong>Payment Status:</strong> {order.payment_status}<br />
              <strong>Order Status:</strong> {order.status}
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={hr} />
            <Text style={footerText}>
              If you have any questions about your order, please contact us:
            </Text>
            <Text style={contactInfo}>
              Email: <Link href={`mailto:${storeEmail}`} style={link}>{storeEmail}</Link><br />
              Phone: {storePhone}
            </Text>
            <Text style={footerText}>
              Thank you for shopping with {storeName}!
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: 'hsl(45, 15%, 97%)', /* Warm cream background */
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  minHeight: '100vh',
  backgroundImage: 'linear-gradient(135deg, hsl(120, 30%, 95%) 0%, hsl(45, 15%, 97%) 100%)',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  marginBottom: '32px',
  maxWidth: '600px',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
};

const header = {
  padding: '40px 40px 32px',
  background: 'linear-gradient(135deg, hsl(150, 45%, 30%) 0%, hsl(120, 40%, 35%) 30%, hsl(85, 55%, 55%) 70%, hsl(45, 50%, 70%) 100%)',
  textAlign: 'center' as const,
  position: 'relative' as const,
};

const headerPattern = {
  position: 'absolute' as const,
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  opacity: 0.3,
};

const brandLogo = {
  width: '60px',
  height: '60px',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 16px',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  fontSize: '24px',
  color: '#ffffff',
  fontWeight: 'bold',
};

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  position: 'relative' as const,
  zIndex: 2,
};

const headerText = {
  color: 'rgba(255, 255, 255, 0.95)',
  fontSize: '18px',
  margin: '0',
  fontWeight: '500',
  position: 'relative' as const,
  zIndex: 2,
};

const orderSummary = {
  padding: '32px 40px',
  background: 'linear-gradient(135deg, hsl(120, 30%, 95%) 0%, hsl(120, 25%, 92%) 100%)',
  border: '1px solid hsl(120, 15%, 88%)',
  borderRadius: '12px',
  margin: '32px 40px',
  position: 'relative' as const,
  overflow: 'hidden' as const,
};

const h2 = {
  color: 'hsl(150, 25%, 15%)',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  position: 'relative' as const,
};

const h3 = {
  color: 'hsl(150, 25%, 15%)',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '40px 40px 20px',
  position: 'relative' as const,
  paddingBottom: '8px',
  borderBottom: '2px solid hsl(120, 30%, 85%)',
  display: 'inline-block',
};

const orderNumber = {
  fontSize: '16px',
  color: '#4a5568',
  margin: '0 0 8px',
};

const orderDate = {
  fontSize: '16px',
  color: '#4a5568',
  margin: '0',
};

const itemRow = {
  padding: '16px 40px',
  borderBottom: '1px solid hsl(120, 15%, 92%)',
  backgroundColor: 'rgba(255, 255, 255, 0.5)',
  margin: '0 20px',
  borderRadius: '8px',
  marginBottom: '8px',
  transition: 'all 0.2s ease',
};

const imageColumn = {
  verticalAlign: 'top' as const,
  width: '80px',
  paddingRight: '12px',
};

const itemColumn = {
  verticalAlign: 'top' as const,
  paddingRight: '20px',
};

const priceColumn = {
  verticalAlign: 'top' as const,
  textAlign: 'right' as const,
  width: '100px',
};

const productImage = {
  width: '80px',
  height: '80px',
  objectFit: 'cover' as const,
  borderRadius: '12px',
  border: '2px solid hsl(120, 30%, 85%)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
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

const itemTotal = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#2d3748',
  margin: '0',
};

const totalsSection = {
  padding: '0 40px',
};

const totalRow = {
  marginBottom: '8px',
};

const totalLabel = {
  fontSize: '16px',
  color: '#4a5568',
  margin: '0',
};

const totalValue = {
  fontSize: '16px',
  color: '#4a5568',
  textAlign: 'right' as const,
  margin: '0',
};

const grandTotalLabel = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#2d3748',
  margin: '0',
};

const grandTotalValue = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#2d3748',
  textAlign: 'right' as const,
  margin: '0',
};

const addressText = {
  fontSize: '16px',
  color: '#4a5568',
  margin: '0 40px 16px',
  whiteSpace: 'pre-line' as const,
};

const shippingNote = {
  fontSize: '14px',
  color: '#718096',
  margin: '0 40px',
};

const footer = {
  padding: '40px 40px',
  textAlign: 'center' as const,
  background: 'linear-gradient(135deg, hsl(120, 25%, 95%) 0%, hsl(45, 15%, 97%) 100%)',
  borderTop: '1px solid hsl(120, 15%, 88%)',
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
  borderColor: 'hsl(120, 15%, 88%)',
  margin: '24px 0',
  borderWidth: '1px',
  borderStyle: 'solid',
  background: 'linear-gradient(90deg, transparent, hsl(120, 15%, 88%), transparent)',
};

export default OrderConfirmationEmail;