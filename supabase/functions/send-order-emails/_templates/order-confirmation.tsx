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
            <Heading style={h1}>{storeName}</Heading>
            <Text style={headerText}>Thank you for your order!</Text>
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
  backgroundColor: '#f8fafc',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#1a202c',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const headerText = {
  color: '#718096',
  fontSize: '18px',
  margin: '0',
};

const orderSummary = {
  padding: '24px 40px',
  backgroundColor: '#f7fafc',
  border: '1px solid #e2e8f0',
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

const orderDate = {
  fontSize: '16px',
  color: '#4a5568',
  margin: '0',
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
  paddingRight: '20px',
};

const priceColumn = {
  verticalAlign: 'top' as const,
  textAlign: 'right' as const,
  width: '100px',
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

export default OrderConfirmationEmail;