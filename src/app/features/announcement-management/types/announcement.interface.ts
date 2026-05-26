import { IAnnouncementGetBaseResponseDto } from './announcement.dto';

export interface IAnnouncement
  extends Pick<IAnnouncementGetBaseResponseDto, 'id' | 'title'> {
  announcementDuration: Date[];
  announcementStatus: string;
  acknowledgmentStats: string;
  originalRawData: IAnnouncementGetBaseResponseDto;
}

export interface IAnnouncementTargetWithAcknowledgement {
  targetId: string;
  targetType: string;
  employeeId: string;
  employeeName: string;
  acknowledged: boolean;
  acknowledgedAt: string | null;
}
