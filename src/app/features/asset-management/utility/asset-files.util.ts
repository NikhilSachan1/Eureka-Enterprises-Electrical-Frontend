export const ASSET_CALIBRATION_FILE_LABEL = 'CALIBRATION';

export function isCalibrationFileLabel(
  label: string | null | undefined
): boolean {
  return label?.trim().toUpperCase() === ASSET_CALIBRATION_FILE_LABEL;
}

export function splitLabeledFileKeys(
  files: { fileKey: string; label?: string | null }[]
): { documentKeys: string[]; calibrationDocumentKeys: string[] } {
  const documentKeys: string[] = [];
  const calibrationDocumentKeys: string[] = [];

  files.forEach(file => {
    if (isCalibrationFileLabel(file.label)) {
      calibrationDocumentKeys.push(file.fileKey);
    } else {
      documentKeys.push(file.fileKey);
    }
  });

  return { documentKeys, calibrationDocumentKeys };
}

export function mergeAssetFilesWithLabels(
  assetFiles: File[],
  calibrationFiles?: File[] | null
): { assetFiles: File[]; assetFileLabels?: string } {
  const labeledCalibrationFiles = calibrationFiles?.length
    ? calibrationFiles
    : [];
  const mergedFiles = [...assetFiles, ...labeledCalibrationFiles];

  if (!labeledCalibrationFiles.length) {
    return { assetFiles: mergedFiles };
  }

  return {
    assetFiles: mergedFiles,
    assetFileLabels: JSON.stringify([
      ...assetFiles.map(() => ''),
      ...labeledCalibrationFiles.map(() => ASSET_CALIBRATION_FILE_LABEL),
    ]),
  };
}
