import { z } from 'zod';
import { AssetUpsertShapeSchema } from './base-asset.schema';
import { transformDateFormat } from '@shared/utility';
import { getCalibrationEndDateFromStartAndFrequency } from '../utility/calibration-date.util';

export const AssetAddRequestSchema = AssetUpsertShapeSchema.strict().transform(
  data => {
    const calibrationStartDate = data.assetCalibrationDate ?? null;
    const calibrationEndDate = calibrationStartDate
      ? getCalibrationEndDateFromStartAndFrequency(
          calibrationStartDate,
          data.assetCalibrationFrequency
        )
      : null;
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
      calibrationStartDate: calibrationStartDate
        ? transformDateFormat(calibrationStartDate)
        : null,
      calibrationEndDate: calibrationEndDate
        ? transformDateFormat(calibrationEndDate)
        : null,
      purchaseDate: transformDateFormat(data.assetPurchaseDate),
      vendorName: data.assetVendorName,
      warrantyStartDate: transformDateFormat(warrantyStartDate),
      warrantyEndDate: transformDateFormat(warrantyEndDate),
      remarks: data.remarks,
      assetFiles: data.assetFiles,
    };
  }
);

export const AssetAddResponseSchema = z.looseObject({
  message: z.string(),
});
