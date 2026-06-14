import z from 'zod';
import { VendorUpsertShapeSchema } from './base-vendor.schema';

export const VendorAddRequestSchema =
  VendorUpsertShapeSchema.strict().transform(data => {
    return {
      vendorType: data.vendorType,
      name: data.vendorName,
      contactNumber: data.contactNumber,
      email: data.emailAddress,
      gstNumber: data.vendorGSTNumber,
      blockNumber: data.blockNumber,
      streetName: data.streetName,
      landmark: data.landmark,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      ifscCode: data.ifscCode,
      accountHolderName: data.accountHolderName,
      country: 'India',
    };
  });

export const VendorAddResponseSchema = z.looseObject({
  message: z.string(),
});
