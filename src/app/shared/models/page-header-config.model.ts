import { IButtonConfig } from "./button.model";

export interface IPageHeaderConfig {
    title: string;
    subtitle: string;
    showHeaderButton: boolean;
    headerButtonConfig?: Partial<IButtonConfig>;
}
