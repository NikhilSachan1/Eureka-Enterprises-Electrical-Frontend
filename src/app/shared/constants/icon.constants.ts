export const ICONS = {
  COMMON: {
    HOME: 'pi pi-home',
    LIST: 'pi pi-list',
    ADD: 'pi pi-plus-circle',
    PLUS: 'pi pi-plus',
    SYNC: 'pi pi-sync',
    BOOK: 'pi pi-book',
    CHART: 'pi pi-chart-bar',
    CHART_LINE: 'pi pi-chart-line',
    FILE: 'pi pi-file',
    ARROW_UP: 'pi pi-arrow-up',
    ARROW_DOWN: 'pi pi-arrow-down',
    /** Link / unlink / transfer (e.g. petro card). */
    ARROW_RIGHT_LEFT: 'pi pi-arrow-right-arrow-left',
    SEARCH: 'pi pi-search',
    FILTER: 'pi pi-filter',
    INFO_CIRCLE: 'pi pi-info-circle',
    CHEVRON_DOWN: 'pi pi-chevron-down',
    CHEVRON_RIGHT: 'pi pi-chevron-right',
    CHEVRON_LEFT: 'pi pi-chevron-left',
    TH_LARGE: 'pi pi-th-large',
    /** Open in new context / external navigation. */
    EXTERNAL_LINK: 'pi pi-external-link',
    /** Simple tick (not filled circle). */
    CHECK_TICK: 'pi pi-check',
    /** View / open detail (table actions, menu). */
    VIEW: 'pi pi-eye',
    DOWNLOAD: 'pi pi-download',
    MAP_MARKER: 'pi pi-map-marker',
    USER: 'pi pi-user',
    USERS: 'pi pi-users',
    CAR: 'pi pi-car',
    /** Force apply / override (e.g. force attendance, force fuel expense). */
    FORCE: 'pi pi-flag',
    PAPERCLIP: 'pi pi-paperclip',
    CLOUD_UPLOAD: 'pi pi-cloud-upload',
    ARROW_RIGHT: 'pi pi-arrow-right',
    ARROW_LEFT: 'pi pi-arrow-left',
    GIFT: 'pi pi-gift',
    PHONE: 'pi pi-phone',
    BRIEFCASE: 'pi pi-briefcase',
    CREDIT_CARD: 'pi pi-credit-card',
    ID_CARD: 'pi pi-id-card',
    EMAIL: 'pi pi-envelope',
    CALENDAR: 'pi pi-calendar',
    WIFI: 'pi pi-wifi',
    WIFI_SLASH: 'pi pi-wifi-slash',
    SPINNER: 'pi pi-spinner',
    SPIN: 'pi pi-spin',
    EXCLAMATION_TRIANGLE: 'pi pi-exclamation-triangle',
    HISTORY: 'pi pi-history',
    MEGAPHONE: 'pi pi-megaphone',
    INBOX: 'pi pi-inbox',
    /** Train / direction (dropdowns). */
    COMPASS: 'pi pi-compass',
    TAG: 'pi pi-tag',
    MOBILE: 'pi pi-mobile',
    /** Row / overflow menu trigger. */
    ELLIPSIS_V: 'pi pi-ellipsis-v',
    FORWARD: 'pi pi-forward',
    GAUGE: 'pi pi-gauge',
    /** Time / duration pulse widgets. */
    CLOCK: 'pi pi-clock',
    CALENDAR_PLUS: 'pi pi-calendar-plus',
    CALENDAR_CLOCK: 'pi pi-calendar-clock',
    /** Quick action / energy (e.g. salary bolt). */
    BOLT: 'pi pi-bolt',
  },
  /** File-type icons (gallery, file lists). Keys match `getMediaTypeFromUrl` + UNSUPPORTED. */
  MEDIA: {
    PDF: 'pi pi-file-pdf',
    DOCUMENT: 'pi pi-file-word',
    SPREADSHEET: 'pi pi-file-excel',
    PRESENTATION: 'pi pi-file',
    IMAGE: 'pi pi-image',
    UNSUPPORTED: 'pi pi-file',
  },
  ACTIONS: {
    /** Same visual as CHECK_CIRCLE; used where a compact “check” label is needed. */
    CHECK: 'pi pi-check-circle',
    CHECK_CIRCLE: 'pi pi-check-circle',
    TIMES: 'pi pi-times-circle',
    PENCIL: 'pi pi-pencil',
    EDIT: 'pi pi-pencil',
    TRASH: 'pi pi-trash',
    EYE: 'pi pi-eye',
    BAN: 'pi pi-ban',
    POWER_OFF: 'pi pi-power-off',
    SEND: 'pi pi-send',
  },
  EMPLOYEE: {
    GROUP: 'pi pi-users',
    USER: 'pi pi-user',
  },
  ATTENDANCE: {
    CALENDAR: 'pi pi-calendar',
    REGULARIZE: 'pi pi-clock',
    CHECK_IN: 'pi pi-sign-in',
    CHECK_OUT: 'pi pi-sign-out',
  },
  EXPENSE: {
    MONEY: 'pi pi-money-bill',
    CAR: 'pi pi-car',
  },
  /**
   * Fuel / petro (transport menu).
   * Note: `pi-tint` is not in PrimeIcons — icon would not render. Use supported glyphs from
   * https://primeng.org/icons — e.g. `pi-bolt` (energy), `pi-gauge` (gauge), `pi-car` (vehicle fuel).
   */
  FUEL: {
    MENU: 'pi pi-bolt',
  },
  LEAVE: {
    GET: 'pi pi-calendar-minus',
    CALENDAR_PLUS: 'pi pi-calendar-plus',
  },
  ASSET: {
    BOX: 'pi pi-box',
    CAR: 'pi pi-car',
  },
  PAYROLL: {
    WALLET: 'pi pi-wallet',
    PAID: 'pi pi-check-circle',
    GENERATE: 'pi pi-file-edit',
  },
  SITE: {
    BUILDING: 'pi pi-building',
  },
  SECURITY: {
    SHIELD: 'pi pi-shield',
    LOCK: 'pi pi-lock',
  },
  SETTINGS: {
    COG: 'pi pi-cog',
    WRENCH: 'pi pi-wrench',
    SLIDERS: 'pi pi-sliders-h',
  },
  THEME: {
    MOON: 'pi pi-moon',
    SUN: 'pi pi-sun',
  },
  STATUS: {
    /** Totals / aggregates on dashboards. */
    TOTAL: 'pi pi-chart-bar',
    AVAILABLE: 'pi pi-check-circle',
    ASSIGNED: 'pi pi-user',
    EXPIRING_SOON: 'pi pi-exclamation-triangle',
    EXPIRED: 'pi pi-times-circle',
  },
} as const;
