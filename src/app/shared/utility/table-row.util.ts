export function isNotRecordCreator(
  createdBy: string | null | undefined,
  loggedInUserId: string | undefined | null
): boolean {
  return !loggedInUserId || !createdBy || createdBy !== loggedInUserId;
}

export function isRecordCreator(
  createdBy: string | null | undefined,
  loggedInUserId: string | undefined | null
): boolean {
  return !!loggedInUserId && !!createdBy && createdBy === loggedInUserId;
}

export function recordCreatorDisableReason(
  entityLabel: string,
  createdBy: string | null | undefined,
  loggedInUserId: string | undefined | null
): string | undefined {
  return isNotRecordCreator(createdBy, loggedInUserId)
    ? `You are not the owner of this ${entityLabel}.`
    : undefined;
}

export function recordCreatorBulkDisableReason(
  entityLabel: string,
  createdBy: string | null | undefined,
  loggedInUserId: string | undefined | null
): string | undefined {
  return isNotRecordCreator(createdBy, loggedInUserId)
    ? `You are not the owner of some of the selected ${entityLabel}.`
    : undefined;
}
