import { TConfigurationValueKind } from '../../types/configuration.types';

export interface IConfigValueNode {
  kind: TConfigurationValueKind;
  stringValue?: string;
  numberValue?: number;
  boolValue?: boolean;
  objectEntries?: IConfigObjectEntry[];
  arrayItems?: IConfigValueNode[];
}

export interface IConfigObjectEntry {
  key: string;
  value: IConfigValueNode;
}
