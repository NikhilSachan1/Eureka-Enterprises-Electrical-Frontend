export enum EDataType {
  TEXT = 'text', // Default nput field & normal text display
  TEXT_WITH_SUBTITLE = 'textWithSubtitle', //only for display
  TEXT_WITH_READ_MORE = 'textWithReadMore', //only for display
  STATUS = 'status', //only for display
  DATE = 'date', //only for display
  DATE_RANGE = 'dateRange', //only for display
  CURRENCY = 'currency', //only for display
  TIME = 'time', //only for display
  DURATION = 'duration', //only for display
  ATTACHMENTS = 'attachments', //only for display in table and in form
  EMAIL = 'email', //only for display - clickable email link
  PHONE = 'phone', //only for display - clickable phone link
  NUMBER = 'number',
  SELECT = 'select',
  AUTOCOMPLETE = 'autocomplete',
  MULTI_SELECT = 'multiselect',
  PASSWORD = 'password',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  TEXT_AREA = 'textarea',
  INDIVIDUAL_NUMBER = 'individual-number',
  PROGRESS = 'progress',
  KNOB = 'knob',
}
