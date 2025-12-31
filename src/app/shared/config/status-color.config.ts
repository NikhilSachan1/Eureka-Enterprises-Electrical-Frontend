export const STATUS_COLOR_GROUPS: Record<string, string[]> = {
  success: [
    // Common statuses
    'available',

    // Approval/Active statuses
    'active',
    'approved',
    'approve',
    'present',
    'clearselection',
    'download',
    'submit',
    'filter',
    'pageheaderbutton1',
    'checkin',
    'total credit',
    'period credit',
    'total credited',
    'active employees',
    'handoverinitiate',
    'handoveraccepted',

    // Calibration
    'calibrated assets',
  ],
  danger: [
    // Common statuses
    'expired',
    'calibration expired',
    'warranty expired',

    // Rejection/Inactive statuses
    'inactive',
    'rejected',
    'reject',
    'absent',
    'delete',
    'checkout',
    'closing balance',
    'total debit',
    'period debit',
    'total consumed',
    'inactive employees',
    'archived',
    'handoverrejected',
    'deallocate',
  ],
  warning: [
    // Common statuses
    'expiring soon',
    'calibration expiring soon',
    'warranty expiring soon',

    // Pending/Action statuses
    'pending',
    'leave',
    'regularize',
    'edit',
    'pageheaderbutton2',
    'cancel',
    'cancelled',
    'new joiners last 30 days',
    'sendpasswordlink',
    'changeemployeestatus',
    'handovercancelled',
  ],
  info: [
    // Common statuses
    'total',
    'assigned',
    'non calibrated assets',

    // Info statuses
    'holiday',
    'view',
    'setpermissions',
    'opening balance',
    'total balance',
    'total employees',
    'male',
    'female',
    'eventhistory',
  ],
};
