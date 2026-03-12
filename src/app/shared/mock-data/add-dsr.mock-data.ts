import {
  createFileFromAsset,
  getRandomItem,
  getRandomNumber,
  TEST_EMPLOYEE_NAMES,
  TEST_PROJECT_WORK_TYPES,
} from './mock-data.constants';
import { IDsrAddUIFormDto } from '@features/site-management/project-management/types/project.dto';

export const ADD_DSR_PREFILLED_DATA: IDsrAddUIFormDto = {
  statusDate: new Date(),
  workDone: [getRandomItem(TEST_PROJECT_WORK_TYPES)],
  reportedEngineerName: getRandomItem(TEST_EMPLOYEE_NAMES),
  reportedEngineerContact: getRandomNumber(10, 'exact'),
  dsrAttachments: [
    createFileFromAsset(
      `/mock-docs/dsr/dsr_attachment_${Math.floor(Math.random() * 4) + 1}.pdf`
    ),
  ],
  note: 'Business DSR for official work',
};
