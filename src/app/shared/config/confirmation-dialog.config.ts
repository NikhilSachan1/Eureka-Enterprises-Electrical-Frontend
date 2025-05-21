export const CONFIRMATION_DIALOG_CONFIG = {
  header: 'Delete Confirmation',
  icon: 'pi pi-exclamation-triangle',
  message:
    'Are you sure you want to delete this item? This action cannot be undone.',
  acceptIcon: 'pi pi-check',
  acceptLabel: 'QQ',
  acceptVisible: true,
  acceptButtonStyleClass: 'p-button-danger',
  rejectIcon: 'pi pi-times',
  rejectLabel: 'Cancel',
  rejectVisible: true,
  rejectButtonStyleClass: 'p-button-secondary',
  closeOnEscape: true,
  dismissableMask: true,
  closable: true,
  position: 'top',
  blockScroll: true,
  rejectButtonProps: {
    label: 'Cancel',
    icon: 'pi pi-times',
    outlined: true,
    size: 'small'
},
acceptButtonProps: {
    label: 'Save',
    icon: 'pi pi-check',
    size: 'small'
},
};
