import { z } from 'zod';
import { uuidField } from '@shared/schemas';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

export const JmcDropdownGetRequestSchema = z
  .object({
    projectName: uuidField,
    docType: z.enum(EDocContext),
  })
  .transform(({ projectName, docType }) => ({
    siteId: projectName,
    partyType: docType,
  }));

const JmcDropdownMetaSchema = z.looseObject({
  jmcNumber: z.string(),
});

export const JmcDropdownRecordSchema = z.looseObject({
  id: uuidField,
  label: z.string(),
  eligible: z.boolean(),
  reason: z.string().nullable(),
  meta: JmcDropdownMetaSchema,
});

export const JmcDropdownGetResponseSchema = z.object({
  records: z.array(JmcDropdownRecordSchema),
});
