import {
  IBankDetailsCellValue,
  IPaidFromAccountSnapshot,
} from '@shared/types/bank-details/bank-details.interface';

export const mapPaidFromAccountToBankDetails = (
  paidFromAccount?: IPaidFromAccountSnapshot | null
): IBankDetailsCellValue | null => {
  if (!paidFromAccount) {
    return null;
  }

  return {
    bankHolderName: paidFromAccount.accountHolderName,
    bankName: paidFromAccount.bankName,
    accountNumber: paidFromAccount.accountNumber,
    ifscCode: paidFromAccount.ifscCode,
    branchName: paidFromAccount.branchName,
  };
};
