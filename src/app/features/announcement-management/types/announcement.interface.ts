import { IAnnouncementGetBaseResponseDto } from './announcement.dto';

export interface IAnnouncement
  extends Pick<IAnnouncementGetBaseResponseDto, 'id' | 'title'> {
  announcementDuration: Date[];
  announcementStatus: string;
  acknowledgmentStats: string;
  originalRawData: IAnnouncementGetBaseResponseDto;
}
