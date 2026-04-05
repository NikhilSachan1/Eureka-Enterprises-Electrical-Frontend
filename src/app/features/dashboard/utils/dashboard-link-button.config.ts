import {
  EButtonActionType,
  EButtonIconPosition,
  EButtonVariant,
  IButtonConfig,
  EButtonSize,
} from '@shared/types';

type DashLinkOverrides = Pick<IButtonConfig, 'label' | 'icon'> &
  Partial<Pick<IButtonConfig, 'id'>>;

/** Outlined small link — matches former `p-button` + `outlined` + `size="small"` + icon right. */
export function dashOutlinedLinkButton(
  overrides: DashLinkOverrides
): Partial<IButtonConfig> {
  return {
    id: EButtonActionType.PAGE_HEADER_BUTTON_1,
    iconPosition: EButtonIconPosition.RIGHT,
    variant: EButtonVariant.OUTLINED,
    size: EButtonSize.SMALL,
    ...overrides,
  };
}

/** Text variant small link — matches former `p-button` + `text` + `size="small"`. */
export function dashTextLinkButton(
  overrides: DashLinkOverrides
): Partial<IButtonConfig> {
  return {
    id: EButtonActionType.PAGE_HEADER_BUTTON_1,
    iconPosition: EButtonIconPosition.RIGHT,
    variant: EButtonVariant.TEXT,
    size: EButtonSize.SMALL,
    ...overrides,
  };
}
