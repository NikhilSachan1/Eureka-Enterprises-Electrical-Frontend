export interface IPublicAssetDetailRow {
  label: string;
  value: string;
}

export interface IPublicAssetDetailSection {
  title: string;
  icon: string;
  rows: IPublicAssetDetailRow[];
}
