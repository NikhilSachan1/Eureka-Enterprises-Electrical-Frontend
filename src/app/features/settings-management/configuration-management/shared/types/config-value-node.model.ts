import { TConfigurationValueKind } from '../../types/configuration.types';

export interface IConfigValueNode {
  kind: TConfigurationValueKind;
  stringValue?: string;
  numberValue?: number;
  boolValue?: boolean;
  /** Calendar date (serialized to ISO date string in JSON). */
  dateValue?: Date;
  objectEntries?: IConfigObjectEntry[];
  arrayItems?: IConfigValueNode[];
}

export interface IConfigObjectEntry {
  key: string;
  value: IConfigValueNode;
}
