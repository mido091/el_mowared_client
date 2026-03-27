import { z } from 'zod';

export const loginSchema = z.object({
  email:    z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const userRegisterSchema = z.object({
  first_name: z.string().trim().min(2, 'First name must be at least 2 characters'),
  last_name:  z.string().trim().min(1, 'Last name is required'),
  email:      z.string().trim().min(1, 'Email is required').email('Invalid email address').toLowerCase(),
  password:   z.string().min(6, 'Password must be at least 6 characters'),
  phone:      z.string().trim().min(8, 'Phone number is too short').optional().or(z.literal('')),
});

export const rfqSchema = z.object({
  title:        z.string().trim().min(3, 'Title is too short'),
  category_id:  z.number().int().positive('Category is required'),
  description:  z.string().trim().min(10, 'Description is too short'),
  quantity:     z.number().int().positive('Quantity must be positive'),
  target_price: z.number().positive().optional(),
  expiration_time: z.string().datetime().optional(),
});

export const vendorRegisterSchema = z.object({
  first_name:   z.string().trim().min(2, 'First name must be at least 2 characters'),
  last_name:    z.string().trim().min(1, 'Last name is required'),
  company_name: z.string().trim().min(2, 'Company name is too short'),
  email:        z.string().trim().min(1, 'Email is required').email('Invalid email address').toLowerCase(),
  password:     z.string().min(6, 'Password must be at least 6 characters'),
  categoryIds:  z.array(z.number()).min(1, 'At least one category is required'),
  phone:        z.string().trim().min(8, 'Phone number is too short'),
  address:      z.string().trim().optional(),
  bio:          z.string().trim().optional(),
});

export const productSchema = z.object({
  titleAr: z.string().trim().min(3, 'Title (AR) is too short'),
  titleEn: z.string().trim().min(3, 'Title (EN) is too short'),
  categoryId: z.number().int().positive('Category is required'),
  price: z.number().positive('Price must be positive'),
  minOrderQuantity: z.number().int().min(1).optional(),
  descAr: z.string().trim().min(10, 'Description (AR) is too short'),
  descEn: z.string().trim().min(10, 'Description (EN) is too short'),
});

export const profileSchema = z.object({
  first_name: z.string().trim().min(2, 'First name must be at least 2 characters'),
  last_name:  z.string().trim().min(1, 'Last name is required'),
  phone:      z.string().trim().min(8, 'Phone number is too short').optional().or(z.literal('')),
});

export const passwordSchema = z.object({
  current: z.string().min(6, 'Current password is required'),
  new:     z.string().min(8, 'New password must be at least 8 characters'),
  confirm: z.string().min(1, 'Confirm password is required'),
}).refine(data => data.new === data.confirm, {
  message: "Passwords don't match",
  path: ["confirm"],
});
