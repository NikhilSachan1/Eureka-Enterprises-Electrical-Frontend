import { IOptionDropdown } from '@shared/types';
import { getMappedValueFromArrayOfObjects } from './object.util';

export interface ILocationParts {
  city: string | null | undefined;
  state: string | null | undefined;
  pincode?: string | null | undefined;
}

export type IFullAddressParts = {
  blockNumber?: string | null | undefined;
  buildingName?: string | null | undefined;
  streetName?: string | null | undefined;
  landmark?: string | null | undefined;
  area?: string | null | undefined;
} & ILocationParts;

export function formatLocation(
  record: ILocationParts,
  states: IOptionDropdown[],
  cities: IOptionDropdown[],
  options?: { includePincode?: boolean }
): string {
  const state = record.state
    ? getMappedValueFromArrayOfObjects(states, record.state)
    : record.state;
  const city = record.city
    ? getMappedValueFromArrayOfObjects(cities, record.city)
    : record.city;

  const parts = [state, city];
  if (options?.includePincode !== false && record.pincode) {
    parts.push(record.pincode);
  }

  return parts.filter(Boolean).join(', ');
}

export function formatFullAddress(
  record: IFullAddressParts,
  states: IOptionDropdown[],
  cities: IOptionDropdown[]
): string {
  const location = formatLocation(record, states, cities);
  return [
    record.blockNumber,
    record.buildingName,
    record.streetName,
    record.landmark,
    record.area,
    location,
  ]
    .filter(Boolean)
    .join(', ');
}
