export interface IBankDetailsCellValue {
  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  bankHolderName?: string | null;
  branchName?: string | null;
}

export interface IPaidFromAccountSnapshot {
  accountHolderName?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  branchName?: string | null;
}
