import { IConfigurationGetBaseResponseDto } from './configuration.dto';

export interface IConfiguration
  extends Pick<
    IConfigurationGetBaseResponseDto,
    'id' | 'module' | 'key' | 'label' | 'valueType' | 'description'
  > {
  originalRawData: IConfigurationGetBaseResponseDto;
}
