import { z } from 'zod';
import { AssetUpsertShapeSchema } from './base-asset.schema';
import { transformDateFormat } from '@shared/utility';

export const AssetAddRequestSchema = AssetUpsertShapeSchema.strict().transform(
  data => {
    const [calibrationStartDate, calibrationEndDate] =
      data.assetCalibrationDate ?? [];
    const [warrantyStartDate, warrantyEndDate] = data.assetWarrantyDate ?? [];
    return {
      assetId: data.assetId,
      name: data.assetName,
      model: data.assetModel,
      serialNumber: data.assetSerialNumber,
      category: data.assetCategory,
      assetType: data.assetType,
      calibrationFrom: data.assetCalibrationFrom,
      calibrationFrequency: data.assetCalibrationFrequency,
      calibrationStartDate: transformDateFormat(calibrationStartDate),
      calibrationEndDate: transformDateFormat(calibrationEndDate),
      purchaseDate: transformDateFormat(data.assetPurchaseDate),
      vendorName: data.assetVendorName,
      warrantyStartDate: transformDateFormat(warrantyStartDate),
      warrantyEndDate: transformDateFormat(warrantyEndDate),
      remarks: data.remarks,
      assetFiles: data.assetFiles,
    };
  }
);

export const AssetAddResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
