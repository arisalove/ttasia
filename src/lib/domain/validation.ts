import { z } from 'zod';
import { SABAH_DISTRICTS } from './types';

const districtEnum = z.enum(SABAH_DISTRICTS);

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupBuyerSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  businessName: z.string().min(2, 'Enter your business name'),
  registrationNumber: z.string().min(2, 'Enter your SSM / business registration number'),
  address: z.string().min(5, 'Enter your business address'),
  district: districtEnum,
  postcode: z.string().optional(),
  businessType: z.enum(['restaurant', 'cafe', 'bakery', 'catering', 'food_stall', 'hotel', 'other']),
});
export type SignupBuyerInput = z.infer<typeof signupBuyerSchema>;

export const signupSupplierSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  businessName: z.string().min(2, 'Enter your business name'),
  registrationNumber: z.string().min(2, 'Enter your SSM / business registration number'),
  address: z.string().min(5, 'Enter your business address'),
  district: districtEnum,
  postcode: z.string().optional(),
  storeName: z.string().min(2, 'Enter your storefront name'),
  storeDescription: z.string().min(10, 'Tell buyers a little about what you supply'),
  supplierType: z.enum(['wholesaler', 'farmer', 'fisherman', 'distributor', 'manufacturer']),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
  minimumOrderSen: z.coerce.number().int().min(0),
});
export type SignupSupplierInput = z.infer<typeof signupSupplierSchema>;

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  qty: z.coerce.number().positive('Quantity must be greater than zero'),
});

export const checkoutSchema = z.object({
  fulfilmentMethod: z.enum(['delivery', 'pickup']),
  district: districtEnum.optional(),
  deliveryAddress: z.string().optional(),
  paymentMethod: z.enum(['bank_transfer', 'cod', 'cop']),
});

export const rfqItemSchema = z.object({
  productId: z.string().optional(),
  description: z.string().min(2),
  qty: z.coerce.number().positive(),
  unit: z.enum(['kg', 'g', 'carton', 'tray', 'packet', 'bottle', 'bag', 'box', 'unit', 'litre']),
});

export const rfqSchema = z.object({
  supplierId: z.string().min(1),
  message: z.string().optional(),
  items: z.array(rfqItemSchema).min(1, 'Add at least one item to your request'),
});

export const priceTierInputSchema = z.object({
  minQty: z.coerce.number().positive('Tier minimum quantity must be greater than zero'),
  maxQty: z.coerce.number().positive().optional(),
  pricePerUnitSen: z.coerce.number().int().positive('Tier price must be greater than zero'),
});
export type PriceTierInput = z.infer<typeof priceTierInputSchema>;

export const productSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1, 'Select a category'),
  name: z.string().min(2, 'Enter a product name'),
  nameMs: z.string().optional(),
  description: z.string().min(5, 'Add a short description'),
  unit: z.enum(['kg', 'g', 'carton', 'tray', 'packet', 'bottle', 'bag', 'box', 'unit', 'litre']),
  packSize: z.string().min(1, 'Describe the pack size'),
  basePriceSen: z.coerce.number().int().positive('Enter a price greater than zero'),
  stockQty: z.coerce.number().min(0),
  minOrderQty: z.coerce.number().positive(),
  prepTimeHours: z.coerce.number().min(0),
  isHalal: z.boolean().default(true),
  imageUrl: z.string().optional(),
  tiers: z.array(priceTierInputSchema).optional(),
});
export type ProductInput = z.infer<typeof productSchema>;

export const deliveryZoneSchema = z.object({
  id: z.string().optional(),
  district: districtEnum,
  deliveryFeeSen: z.coerce.number().int().min(0),
  freeDeliveryThresholdSen: z.coerce.number().int().min(0).optional(),
  etaHoursMin: z.coerce.number().int().min(0),
  etaHoursMax: z.coerce.number().int().min(0),
});

export const reviewSchema = z.object({
  orderId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const businessProfileSchema = z.object({
  businessName: z.string().min(2, 'Enter your business name'),
  address: z.string().min(5, 'Enter your business address'),
  district: districtEnum,
  postcode: z.string().optional(),
  phone: z.string().min(7, 'Enter a valid phone number'),
});
export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;

export const messageSchema = z.object({
  threadId: z.string().optional(),
  supplierId: z.string().optional(),
  body: z.string().min(1, 'Write a message before sending'),
});
