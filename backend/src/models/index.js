const mongoose = require('mongoose');

const { Schema } = mongoose;
const timestamps = { createdAt: 'created_at', updatedAt: 'updated_at' };
const jsonOptions = {
  timestamps,
  toJSON: {
    virtuals: true,
    transform(_document, value) {
      value.id = value._id.toString();
      delete value._id;
      delete value.__v;
      return value;
    }
  }
};

const categorySchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' }
}, jsonOptions);

const productImageSchema = new Schema({
  image_url: { type: String, required: true },
  is_primary: { type: Number, default: 0 }
}, { toJSON: jsonOptions.toJSON });

const productSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  short_description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  old_price: { type: Number, default: null },
  discount_percentage: { type: Number, default: 0 },
  stock_quantity: { type: Number, default: 0, min: 0 },
  sku: { type: String, required: true, unique: true, trim: true },
  brand: { type: String, default: 'Ahmed Moblie' },
  category_id: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  rating: { type: Number, default: 5 },
  is_featured: { type: Number, default: 0 },
  is_new_arrival: { type: Number, default: 0 },
  is_best_seller: { type: Number, default: 0 },
  is_active: { type: Number, default: 1 },
  is_deal: { type: Number, default: 0 },
  images: { type: [productImageSchema], default: [] }
}, jsonOptions);

const adminSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password_hash: { type: String, required: true }
}, jsonOptions);

const orderItemSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', default: null },
  product_name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit_price: { type: Number, required: true },
  subtotal: { type: Number, required: true }
}, { toJSON: jsonOptions.toJSON });

const paymentSchema = new Schema({
  payment_method: { type: String, required: true },
  transaction_id: { type: String, default: null },
  amount: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  provider: { type: String, default: 'manual' },
  provider_reference: { type: String, default: null }
}, { timestamps, toJSON: jsonOptions.toJSON });

const orderSchema = new Schema({
  customer_name: { type: String, required: true },
  customer_email: { type: String, required: true },
  customer_phone: { type: String, required: true },
  shipping_address: { type: String, required: true },
  city: { type: String, required: true },
  postal_code: { type: String, required: true },
  order_notes: { type: String, default: '' },
  payment_method: { type: String, default: 'cod' },
  subtotal: { type: Number, required: true },
  delivery_fee: { type: Number, default: 0 },
  total_amount: { type: Number, required: true },
  payment_status: { type: String, default: 'pending' },
  order_status: { type: String, default: 'pending' },
  items: { type: [orderItemSchema], default: [] },
  payments: { type: [paymentSchema], default: [] }
}, jsonOptions);

const flashDealSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  flash_price: { type: Number, required: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  is_active: { type: Number, default: 1 }
}, jsonOptions);

const auditLogSchema = new Schema({
  admin_id: { type: String, default: 'system' },
  action: { type: String, required: true },
  entity_type: { type: String, required: true },
  entity_id: { type: String, required: true },
  details: { type: String, default: '' }
}, { ...jsonOptions, timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = {
  Admin: mongoose.models.Admin || mongoose.model('Admin', adminSchema),
  AuditLog: mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema),
  Category: mongoose.models.Category || mongoose.model('Category', categorySchema),
  FlashDeal: mongoose.models.FlashDeal || mongoose.model('FlashDeal', flashDealSchema),
  Order: mongoose.models.Order || mongoose.model('Order', orderSchema),
  Product: mongoose.models.Product || mongoose.model('Product', productSchema)
};