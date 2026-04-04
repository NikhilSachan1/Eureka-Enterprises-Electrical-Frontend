import { IDocGetBaseResponseDto } from './doc.dto';

export interface IDoc
  extends Pick<
    IDocGetBaseResponseDto,
    | 'id'
    | 'documentType'
    | 'documentNumber'
    | 'documentDate'
    | 'amount'
    | 'remarks'
  > {
  docDocuments: string[];
  originalRawData: IDocGetBaseResponseDto;
}

export interface IDocDetailResolverResponse extends IDocGetBaseResponseDto {
  preloadedFiles?: File[];
}
