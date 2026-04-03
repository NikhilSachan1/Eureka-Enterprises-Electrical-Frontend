import { IDsrDetailGetResponseDto, IDsrGetBaseResponseDto } from './dsr.dto';

export interface IDsr
  extends Pick<
    IDsrGetBaseResponseDto,
    | 'id'
    | 'reportDate'
    | 'workTypes'
    | 'reportingEngineerName'
    | 'reportingEngineerContact'
    | 'remarks'
  > {
  createdByUser: IDsrGetBaseResponseDto['createdByUser'] & {
    fullName: string;
  };
  dsrDocuments: string[];
  originalRawData: IDsrGetBaseResponseDto;
}

export interface IDsrDetailResolverResponse extends IDsrDetailGetResponseDto {
  preloadedFiles?: File[];
}
