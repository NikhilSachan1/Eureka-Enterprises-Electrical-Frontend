import { roundCurrencyAmount } from '@shared/utility';
import { IOptionDropdown } from '@shared/types';
import {
  IPoGetBaseResponseDto,
  IPoItemFormDto,
  IPoItemSuggestionsGetResponseDto,
} from '../types/po.dto';

export function computePoLineItemAmount(
  quantity: number,
  rate: number
): number {
  if (!Number.isFinite(quantity) || !Number.isFinite(rate)) {
    return 0;
  }
  return roundCurrencyAmount(quantity * rate);
}

export function mapPoLineItemsForForm(
  items: IPoGetBaseResponseDto['items']
): IPoItemFormDto[] {
  if (!items?.length) {
    return [];
  }

  return items.map(item => {
    const quantity = Number(item.quantity);
    const rate = Number(item.rate);
    const savedAmount = Number(item.amount);
    return {
      itemName: item.itemName,
      hsnCode: item.hsnCode ?? null,
      make: item.make ?? null,
      quantity,
      unit: item.unit?.trim() ? item.unit.trim() : '',
      rate,
      amount: Number.isFinite(savedAmount)
        ? savedAmount
        : computePoLineItemAmount(quantity, rate),
    };
  });
}

export function mapPoLineItemsForRequest(
  items: Array<Partial<IPoItemFormDto>> | null | undefined
): IPoItemFormDto[] {
  if (!items?.length) {
    return [];
  }

  return items.map(item => {
    const quantity = Number(item.quantity);
    const rate = Number(item.rate);
    return {
      itemName: String(item.itemName ?? '').trim(),
      hsnCode: item.hsnCode?.trim() ? item.hsnCode.trim() : null,
      make: item.make?.trim() ? item.make.trim() : null,
      quantity,
      unit: String(item.unit ?? '').trim(),
      rate,
      amount: computePoLineItemAmount(quantity, rate),
    };
  });
}

export function computePoTotalsFromItems(
  items: Array<Partial<IPoItemFormDto>> | null | undefined,
  gstPercent: number
): { taxableAmount: number; gstAmount: number; totalAmount: number } {
  const taxableAmount = roundCurrencyAmount(
    (items ?? []).reduce((sum, item) => {
      const quantity = Number(item.quantity);
      const rate = Number(item.rate);
      return sum + computePoLineItemAmount(quantity, rate);
    }, 0)
  );
  const gstAmount = roundCurrencyAmount(
    Number.isFinite(gstPercent) ? taxableAmount * (gstPercent / 100) : 0
  );
  const totalAmount = roundCurrencyAmount(taxableAmount + gstAmount);

  return { taxableAmount, gstAmount, totalAmount };
}

export function mapPoItemSuggestionsToDropdown(
  records: IPoItemSuggestionsGetResponseDto['records']
): IOptionDropdown[] {
  return records.flatMap(record => {
    const name = record.name.trim();
    if (!name) {
      return [];
    }
    return [{ label: name, value: name }];
  });
}
