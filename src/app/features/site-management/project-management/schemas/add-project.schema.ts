import z from 'zod';
import { ProjectUpsertShapeSchema } from './base-project.schema';
import { transformDateFormat } from '@shared/utility';

export const ProjectAddRequestSchema =
  ProjectUpsertShapeSchema.strict().transform(data => {
    const [startDate, endDate] = data.timeline ?? [];
    return {
      name: data.projectName,
      siteTypes: data.projectType,
      companyId: data.companyName,
      contractorIds: data.contractorNames,
      vendorIds: data.vendorNames,
      managerName: data.siteManagerName,
      managerContact: data.siteManagerContact,
      startDate: transformDateFormat(startDate),
      endDate: transformDateFormat(endDate),
      baseDistanceKm: data.baseDistanceKm,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      country: 'India',
      workTypes: data.workTypes,
      notes: data.remarks,
    };
  });

export const ProjectAddResponseSchema = z.looseObject({
  message: z.string(),
});
