import { pgTable, uuid, text, timestamp, boolean, integer, numeric, jsonb, pgEnum, uniqueIndex, index, foreignKey, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enums
export const appRoleEnum = pgEnum('app_role', ['admin', 'moderator', 'user']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'shipped', 'completed', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'failed', 'refunded']);
export const addressTypeEnum = pgEnum('address_type', ['home', 'work', 'other']);
export const couponTypeEnum = pgEnum('coupon_type', ['percentage', 'fixed_amount']);
export const contactStatusEnum = pgEnum('contact_status', ['new', 'in_progress', 'resolved']);
export const platformEnum = pgEnum('platform', ['google_ads', 'meta_pixel', 'tiktok_pixel']);
export const feedFormatEnum = pgEnum('feed_format', ['xml', 'csv', 'json']);
export const feedPlatformEnum = pgEnum('feed_platform', ['meta', 'google', 'tiktok', 'pinterest', 'snapchat', 'microsoft', 'twitter', 'linkedin', 'generic']);

// Profiles table
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  email: text('email'),
  phone: text('phone'),
  dateOfBirth: timestamp('date_of_birth'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// User roles table
export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  role: appRoleEnum('role').notNull().default('user'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueUserRole: uniqueIndex('unique_user_role').on(table.userId, table.role),
}));

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  imageUrl: text('image_url'),
  parentId: uuid('parent_id'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),
  bannerImageUrl: text('banner_image_url'),
  colorScheme: text('color_scheme').default('from-green-400 to-green-600'),
  iconName: text('icon_name'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Products table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  shortDescription: text('short_description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  comparePrice: numeric('compare_price', { precision: 10, scale: 2 }),
  costPrice: numeric('cost_price', { precision: 10, scale: 2 }),
  sku: text('sku').unique(),
  barcode: text('barcode'),
  trackInventory: boolean('track_inventory').default(true),
  inventoryQuantity: integer('inventory_quantity').default(0),
  weight: numeric('weight', { precision: 8, scale: 2 }),
  requiresShipping: boolean('requires_shipping').default(true),
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),
  isBestSeller: boolean('is_best_seller').default(false),
  isNewArrival: boolean('is_new_arrival').default(false),
  isKitsDeals: boolean('is_kits_deals').default(false),
  tags: text('tags').array(),
  keywords: text('keywords').array(),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  features: text('features'),
  ingredients: text('ingredients'),
  usageInstructions: text('usage_instructions'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  bestSellerIdx: index('idx_products_best_seller').on(table.isBestSeller).where(sql`${table.isBestSeller} = true AND ${table.isActive} = true`),
  newArrivalIdx: index('idx_products_new_arrival').on(table.isNewArrival).where(sql`${table.isNewArrival} = true AND ${table.isActive} = true`),
  featuredIdx: index('idx_products_featured').on(table.isFeatured).where(sql`${table.isFeatured} = true AND ${table.isActive} = true`),
  kitsDealsIdx: index('idx_products_kits_deals').on(table.isKitsDeals).where(sql`${table.isKitsDeals} = true AND ${table.isActive} = true`),
}));

// Product categories junction table
export const productCategories = pgTable('product_categories', {
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: uniqueIndex('product_categories_pkey').on(table.productId, table.categoryId),
  productIdIdx: index('idx_product_categories_product_id').on(table.productId),
  categoryIdIdx: index('idx_product_categories_category_id').on(table.categoryId),
}));

// Product images table
export const productImages = pgTable('product_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  altText: text('alt_text'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Product variants table
export const productVariants = pgTable('product_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price').notNull(),
  comparePrice: numeric('compare_price'),
  sku: text('sku'),
  inventoryQuantity: integer('inventory_quantity').notNull().default(0),
  weight: numeric('weight'),
  variantOptions: jsonb('variant_options').default({}),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueNamePerProduct: uniqueIndex('idx_product_variants_unique_name_per_product').on(table.productId, sql`LOWER(TRIM(${table.name}))`),
  uniqueSku: uniqueIndex('idx_product_variants_unique_sku').on(table.sku).where(sql`${table.sku} IS NOT NULL AND ${table.sku} != ''`),
  productIdIdx: index('idx_product_variants_product_id').on(table.productId),
  productIdActiveIdx: index('idx_product_variants_product_id_active').on(table.productId, table.isActive),
  skuIdx: index('idx_product_variants_sku').on(table.sku).where(sql`${table.sku} IS NOT NULL`),
}));

// Product variant images table
export const productVariantImages = pgTable('product_variant_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  variantId: uuid('variant_id').notNull().references(() => productVariants.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  altText: text('alt_text'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  variantIdIdx: index('idx_product_variant_images_variant_id').on(table.variantId),
}));

// Cart items table
export const cartItems = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  variantId: uuid('variant_id').references(() => productVariants.id),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueUserProduct: uniqueIndex('cart_items_user_product_unique').on(table.userId, table.productId),
  variantIdIdx: index('idx_cart_items_variant_id').on(table.variantId),
}));

// Orders table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'),
  orderNumber: text('order_number').notNull().unique(),
  status: orderStatusEnum('status').notNull().default('pending'),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }).default('0'),
  shippingAmount: numeric('shipping_amount', { precision: 10, scale: 2 }).default('0'),
  discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).default('0'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),
  paymentStatus: paymentStatusEnum('payment_status').default('pending'),
  paymentMethod: text('payment_method'),
  shippingAddress: jsonb('shipping_address'),
  billingAddress: jsonb('billing_address'),
  notes: text('notes'),
  couponId: uuid('coupon_id'),
  couponCode: text('coupon_code'),
  shippedAt: timestamp('shipped_at'),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Order items table
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  variantId: uuid('variant_id').references(() => productVariants.id),
  quantity: integer('quantity').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  variantIdIdx: index('idx_order_items_variant_id').on(table.variantId),
}));

// Addresses table
export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  type: addressTypeEnum('type').notNull(),
  isDefault: boolean('is_default').default(false),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  company: text('company'),
  addressLine1: text('address_line_1').notNull(),
  addressLine2: text('address_line_2'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  postalCode: text('postal_code').notNull(),
  country: text('country').notNull().default('US'),
  phone: text('phone'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Wishlists table
export const wishlists = pgTable('wishlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  uniqueUserProduct: uniqueIndex('wishlists_user_product_unique').on(table.userId, table.productId),
}));

// Coupons table
export const coupons = pgTable('coupons', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  type: couponTypeEnum('type').notNull(),
  value: numeric('value', { precision: 10, scale: 2 }).notNull(),
  minimumAmount: numeric('minimum_amount', { precision: 10, scale: 2 }),
  usageLimit: integer('usage_limit'),
  usedCount: integer('used_count').default(0),
  isActive: boolean('is_active').default(true),
  startsAt: timestamp('starts_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
  userUsageLimit: integer('user_usage_limit'),
  eligibleUsers: text('eligible_users').default('both'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Coupon usage table
export const couponUsage = pgTable('coupon_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  couponId: uuid('coupon_id').notNull().references(() => coupons.id, { onDelete: 'cascade' }),
  userId: uuid('user_id'),
  orderId: uuid('order_id'),
  discountAmount: numeric('discount_amount').notNull(),
  usedAt: timestamp('used_at').notNull().defaultNow(),
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  rating: integer('rating').notNull(),
  title: text('title'),
  content: text('content'),
  isVerified: boolean('is_verified').default(false),
  isApproved: boolean('is_approved').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_reviews_user_id').on(table.userId),
  productIdIdx: index('idx_reviews_product_id').on(table.productId),
  isApprovedIdx: index('idx_reviews_is_approved').on(table.isApproved),
}));

// Settings table
export const settings = pgTable('settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  category: text('category').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Hero slides table
export const heroSlides = pgTable('hero_slides', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  imageUrl: text('image_url').notNull(),
  linkUrl: text('link_url'),
  linkText: text('link_text').default('Shop Now'),
  isActive: boolean('is_active').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  autoScrollSpeed: integer('auto_scroll_speed').default(5000),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Testimonials table
export const testimonials = pgTable('testimonials', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerName: text('customer_name').notNull(),
  rating: integer('rating').notNull(),
  content: text('content').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Newsletter subscribers table
export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  subscribedAt: timestamp('subscribed_at').defaultNow(),
  isActive: boolean('is_active').default(true),
  unsubscribedAt: timestamp('unsubscribed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  emailIdx: index('idx_newsletter_subscribers_email').on(table.email),
  activeIdx: index('idx_newsletter_subscribers_active').on(table.isActive),
}));

// Contact submissions table
export const contactSubmissions = pgTable('contact_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  message: text('message').notNull(),
  status: contactStatusEnum('status').default('new'),
  submittedAt: timestamp('submitted_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  statusIdx: index('idx_contact_submissions_status').on(table.status),
  submittedAtIdx: index('idx_contact_submissions_submitted_at').on(table.submittedAt),
}));

// Advertising pixels table
export const advertisingPixels = pgTable('advertising_pixels', {
  id: uuid('id').primaryKey().defaultRandom(),
  platform: platformEnum('platform').notNull(),
  pixelId: text('pixel_id').notNull(),
  isEnabled: boolean('is_enabled').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniquePlatform: uniqueIndex('advertising_pixels_platform_unique').on(table.platform),
}));

// Pixel events table
export const pixelEvents = pgTable('pixel_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  pixelId: uuid('pixel_id').notNull().references(() => advertisingPixels.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(),
  eventValue: numeric('event_value').default('0'),
  currency: text('currency').default('USD'),
  productId: uuid('product_id'),
  orderId: uuid('order_id'),
  userId: uuid('user_id'),
  sessionId: text('session_id'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  pixelIdIdx: index('idx_pixel_events_pixel_id').on(table.pixelId),
  eventTypeIdx: index('idx_pixel_events_event_type').on(table.eventType),
  createdAtIdx: index('idx_pixel_events_created_at').on(table.createdAt),
  userIdIdx: index('idx_pixel_events_user_id').on(table.userId),
  sessionIdIdx: index('idx_pixel_events_session_id').on(table.sessionId),
  orderIdIdx: index('idx_pixel_events_order_id').on(table.orderId),
  productIdIdx: index('idx_pixel_events_product_id').on(table.productId),
}));

// Catalog feeds table
export const catalogFeeds = pgTable('catalog_feeds', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  platform: feedPlatformEnum('platform').notNull(),
  format: feedFormatEnum('format').notNull().default('xml'),
  feedUrlSlug: text('feed_url_slug').notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  categoryFilter: text('category_filter').array().default(sql`'{}'::text[]`),
  includeVariants: boolean('include_variants').notNull().default(true),
  cacheDuration: integer('cache_duration').notNull().default(3600),
  lastGeneratedAt: timestamp('last_generated_at'),
  lastError: text('last_error'),
  generationCount: integer('generation_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  slugIdx: index('idx_catalog_feeds_slug').on(table.feedUrlSlug),
  activeIdx: index('idx_catalog_feeds_active').on(table.isActive),
}));

// Catalog feed history table
export const catalogFeedHistory = pgTable('catalog_feed_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  feedId: uuid('feed_id').notNull().references(() => catalogFeeds.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('success'),
  productCount: integer('product_count').notNull().default(0),
  validationErrors: jsonb('validation_errors').default(sql`'[]'::jsonb`),
  generationTimeMs: integer('generation_time_ms'),
  fileSizeBytes: integer('file_size_bytes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  feedIdIdx: index('idx_catalog_feed_history_feed_id').on(table.feedId),
}));

// Product recommendation views tracking
export const productRecommendationViews = pgTable('product_recommendation_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  recommendedProductId: uuid('recommended_product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').notNull(),
  userId: uuid('user_id'),
  source: text('source').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  productIdx: index('idx_recommendation_views_product').on(table.productId, table.createdAt),
  recommendedIdx: index('idx_recommendation_views_recommended').on(table.recommendedProductId),
}));

// Product recommendation conversions tracking
export const productRecommendationConversions = pgTable('product_recommendation_conversions', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  recommendedProductId: uuid('recommended_product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').notNull(),
  userId: uuid('user_id'),
  source: text('source').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  productIdx: index('idx_recommendation_conversions_product').on(table.productId, table.createdAt),
  recommendedIdx: index('idx_recommendation_conversions_recommended').on(table.recommendedProductId),
}));
