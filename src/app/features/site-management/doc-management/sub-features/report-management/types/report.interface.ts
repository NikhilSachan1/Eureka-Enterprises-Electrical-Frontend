import { IReportGetBaseResponseDto } from './report.dto';

export interface IReport
  extends Pick<
    IReportGetBaseResponseDto,
    | 'id'
    | 'reportNumber'
    | 'reportDate'
    | 'contractor'
    | 'vendor'
    | 'site'
    | 'company'
    | 'jmc'
  > {
  siteCityStateSubtitle: string;
  fileKeys: string[];
  originalRawData: IReportGetBaseResponseDto;
}
