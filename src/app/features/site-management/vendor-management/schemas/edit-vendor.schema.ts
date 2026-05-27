import z from 'zod';
import { VendorUpsertShapeSchema } from './base-vendor.schema';
import { EVendorType } from '../types/vendor.enum';

export const VendorEditRequestSchema =
  VendorUpsertShapeSchema.strict().transform(data => {
    return {
      vendorType: data.vendorType,
      name: data.vendorName,
      contactNumber: data.contactNumber,
      email: data.emailAddress,
      gstNumber:
        data.vendorType === EVendorType.FREELANCER
          ? null
          : data.vendorGSTNumber,
      blockNumber: data.blockNumber,
      streetName: data.streetName,
      landmark: data.landmark,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      country: 'India',
    };
  });

export const VendorEditResponseSchema = z.looseObject({
  message: z.string(),
});
