import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  userRegisterSchema,
  rfqSchema,
  vendorRegisterSchema,
  profileSchema,
  passwordSchema,
  productSchema,
} from '@/validation/schemas';

const valid = (schema, data) => schema.safeParse(data).success;
const errors = (schema, data) => schema.safeParse(data).error?.issues?.map((i) => i.path.join('.')) || [];

describe('Zod validation schemas', () => {
  describe('loginSchema', () => {
    it('passes with valid credentials', () => {
      expect(valid(loginSchema, { email: 'user@example.com', password: 'secret123' })).toBe(true);
    });

    it('fails with invalid email', () => {
      expect(errors(loginSchema, { email: 'bad-email', password: 'secret123' })).toContain('email');
    });

    it('fails with short password', () => {
      expect(errors(loginSchema, { email: 'user@example.com', password: '123' })).toContain('password');
    });
  });

  describe('userRegisterSchema', () => {
    const base = {
      first_name: 'Ali',
      last_name: 'Hassan',
      email: 'ali@example.com',
      password: 'password123',
      phone: '01012345678',
    };

    it('passes with valid user registration data', () => {
      expect(valid(userRegisterSchema, base)).toBe(true);
    });

    it('allows empty phone', () => {
      expect(valid(userRegisterSchema, { ...base, phone: '' })).toBe(true);
    });

    it('fails with short first name', () => {
      expect(errors(userRegisterSchema, { ...base, first_name: 'A' })).toContain('first_name');
    });
  });

  describe('rfqSchema', () => {
    const base = {
      title: 'Need industrial switches',
      category_id: 5,
      description: 'We need 500 managed switches for a new warehouse deployment.',
      quantity: 100,
      target_price: 1200,
      expiration_time: '2026-12-31T12:00:00.000Z',
    };

    it('passes with valid RFQ data', () => {
      expect(valid(rfqSchema, base)).toBe(true);
    });

    it('fails with invalid category', () => {
      expect(errors(rfqSchema, { ...base, category_id: 0 })).toContain('category_id');
    });

    it('fails with short description', () => {
      expect(errors(rfqSchema, { ...base, description: 'short' })).toContain('description');
    });
  });

  describe('vendorRegisterSchema', () => {
    const base = {
      first_name: 'Mowared',
      last_name: 'Vendor',
      company_name: 'Tech Corp',
      email: 'vendor@example.com',
      password: 'securePass1',
      categoryIds: [1, 2],
      phone: '01012345678',
      address: 'Cairo',
      bio: 'Trusted marketplace supplier',
    };

    it('passes with valid vendor data', () => {
      expect(valid(vendorRegisterSchema, base)).toBe(true);
    });

    it('fails without categoryIds', () => {
      expect(errors(vendorRegisterSchema, { ...base, categoryIds: [] })).toContain('categoryIds');
    });

    it('fails with short phone number', () => {
      expect(errors(vendorRegisterSchema, { ...base, phone: '1234' })).toContain('phone');
    });
  });

  describe('productSchema', () => {
    const base = {
      titleAr: 'منتج تجريبي',
      titleEn: 'Test product',
      categoryId: 3,
      price: 250,
      minOrderQuantity: 10,
      descAr: 'وصف عربي طويل بما يكفي لاجتياز التحقق.',
      descEn: 'A long enough English description for validation.',
    };

    it('passes with valid product data', () => {
      expect(valid(productSchema, base)).toBe(true);
    });

    it('fails with missing category', () => {
      expect(errors(productSchema, { ...base, categoryId: 0 })).toContain('categoryId');
    });

    it('fails with short Arabic description', () => {
      expect(errors(productSchema, { ...base, descAr: 'قصير' })).toContain('descAr');
    });
  });

  describe('profileSchema', () => {
    const base = {
      first_name: 'Mohammed',
      last_name: 'Ali',
      phone: '01012345678',
    };

    it('passes with valid profile data', () => {
      expect(valid(profileSchema, base)).toBe(true);
    });

    it('allows empty phone', () => {
      expect(valid(profileSchema, { ...base, phone: '' })).toBe(true);
    });

    it('fails with short last name', () => {
      expect(errors(profileSchema, { ...base, last_name: '' })).toContain('last_name');
    });
  });

  describe('passwordSchema', () => {
    it('passes with matching passwords', () => {
      expect(valid(passwordSchema, { current: 'oldpass', new: 'newpassword', confirm: 'newpassword' })).toBe(true);
    });

    it('fails when passwords do not match', () => {
      expect(errors(passwordSchema, { current: 'oldpass', new: 'newpassword', confirm: 'different' })).toContain('confirm');
    });

    it('fails with short new password', () => {
      expect(errors(passwordSchema, { current: 'oldpass', new: 'short', confirm: 'short' })).toContain('new');
    });
  });
});
