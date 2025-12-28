import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { APP_CONFIG } from '@core/config';
import { AppConfigService } from '@core/services';
import { EmployeeService } from '@features/employee-management/services/employee.service';
import {
  IEmployeeDetailGetRequestDto,
  IEmployeeDetailGetResponseDto,
  IEmployeeGetBaseResponseDto,
} from '@features/employee-management/types/employee.dto';
import {
  IEmployeeAuditItem,
  IEmployeeDetail,
  IEmployeeDetailBasicInfo,
  IEmployeeDetailData,
  IEmployeeDetailQuickInfo,
  IEmployeeDocumentInfo,
} from '@features/employee-management/types/employee.interface';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { ICONS } from '@shared/constants';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { LoadingService } from '@shared/services/loading.service';
import {
  EDataType,
  ETabMode,
  IGalleryInputData,
  EButtonActionType,
  EButtonVariant,
  IButtonConfig,
} from '@shared/types';
import {
  ITabChange,
  ITabItem,
} from '@shared/types/nav-tabs/tab-item.interface';
import { finalize, switchMap, catchError, of } from 'rxjs';
import { Card } from 'primeng/card';
import { StatusTagComponent } from '@shared/components/status-tag/status-tag.component';
import { ChipComponent } from '@shared/components/chip/chip.component';
import { NavTabsComponent } from '@shared/components/nav-tabs/nav-tabs.component';
import { Divider } from 'primeng/divider';
import { NgClass, DatePipe, TitleCasePipe } from '@angular/common';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ImageComponent } from '@shared/components/image/image.component';
import {
  AvatarService,
  GalleryService,
  AttachmentsService,
  AppConfigurationService,
} from '@shared/services';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';

@Component({
  selector: 'app-get-employee-detail',
  imports: [
    Card,
    StatusTagComponent,
    ChipComponent,
    NavTabsComponent,
    Divider,
    NgClass,
    DatePipe,
    TitleCasePipe,
    ButtonComponent,
    ImageComponent,
  ],
  templateUrl: './get-employee-detail.component.html',
  styleUrl: './get-employee-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetEmployeeDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    employee: IEmployeeGetBaseResponseDto;
  };

  private readonly employeeService = inject(EmployeeService);
  private readonly loadingService = inject(LoadingService);
  protected readonly appConfigService = inject(AppConfigService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly avatarService = inject(AvatarService);
  private readonly galleryService = inject(GalleryService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly router = inject(Router);

  icons = ICONS;
  tabModeType = ETabMode.CONTENT;
  protected readonly ALL_DATA_TYPES = EDataType;

  protected tabs = computed(() => this.getTabs());
  protected readonly activeTabIndex = signal(0);
  protected readonly _employeeDetails = signal<IEmployeeDetail | undefined>(
    undefined
  );

  override onDrawerShow(): void {
    this.loadEmployeeDetails();
  }

  private loadEmployeeDetails(): void {
    this.loadingService.show({
      title: 'Loading Employee Details',
      message: 'Please wait while we load the employee details...',
    });

    const paramData = this.prepareParamData();

    this.employeeService
      .getEmployeeDetailById(paramData)
      .pipe(
        switchMap((response: IEmployeeDetailGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          const { employeeName, employeeProfilePicture } = mappedData.quickInfo;

          // Set avatar URL immediately
          mappedData.quickInfo.avatarUrl =
            this.avatarService.getAvatarFromName(employeeName);
          mappedData.quickInfo.profilePictureUrl =
            mappedData.quickInfo.avatarUrl; // Default to avatar

          this._employeeDetails.set(mappedData);
          this.logger.logUserAction('Employee details loaded successfully');

          if (!employeeProfilePicture) {
            return of(null);
          }

          return this.attachmentsService
            .getFullMediaUrl(employeeProfilePicture)
            .pipe(catchError(() => of(null)));
        }),
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          const employeeDetails = this._employeeDetails();
          if (employeeDetails && response?.url) {
            employeeDetails.quickInfo.profilePictureUrl = response.url;
            this._employeeDetails.set({ ...employeeDetails });
          }
        },
        error: error => {
          console.error('error', error);
        },
      });
  }

  private prepareParamData(): IEmployeeDetailGetRequestDto {
    return {
      id: this.drawerData.employee.id,
    };
  }

  private mapDetailData(
    response: IEmployeeDetailGetResponseDto
  ): IEmployeeDetail {
    const quickInfo: IEmployeeDetailQuickInfo = {
      employeeStatus: response.status,
      employeeDesignation: getMappedValueFromArrayOfObjects(
        this.appConfigurationService.designations(),
        response.designation
      ),
      employeeEmployeeId: response.employeeId,
      employeeName: `${response.firstName} ${response.lastName}`,
      employeeProfilePicture: response.profilePicture,
      avatarUrl: '',
      profilePictureUrl: '',
    };

    const employeeBasicInfo: IEmployeeDetailBasicInfo[] = [
      {
        label: 'Email',
        value: response.email,
        icon: this.icons.COMMON.EMAIL,
        bgColor: 'bg-blue-50',
      },
      {
        label: 'Phone',
        value: response.contactNumber,
        icon: this.icons.COMMON.PHONE,
        bgColor: 'bg-green-50',
      },
      {
        label: 'Gender',
        value: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.genders(),
          response.gender
        ),
        icon: this.icons.COMMON.USER,
        bgColor: 'bg-yellow-50',
      },
      {
        label: 'Joining Date',
        value: response.dateOfJoining,
        icon: this.icons.COMMON.CALENDAR,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
        bgColor: 'bg-red-50',
      },
    ];

    const employeeDetail: IEmployeeDetailData[][] = [
      [
        {
          title: 'Basic Information',
          icon: this.icons.COMMON.INFO_CIRCLE,
          fields: [
            {
              label: 'Full Name',
              value: `${response.firstName} ${response.lastName}`,
            },
            {
              label: "Father's Name",
              value: response.fatherName,
            },
            {
              label: 'Gender',
              value: getMappedValueFromArrayOfObjects(
                this.appConfigurationService.genders(),
                response.gender
              ),
            },
            {
              label: 'Date of Birth',
              value: response.dateOfBirth,
              type: EDataType.DATE,
              format: this.appConfigService.dateFormats.DEFAULT,
            },
            {
              label: 'Blood Group',
              value: getMappedValueFromArrayOfObjects(
                this.appConfigurationService.bloodGroups(),
                response.bloodGroup
              ),
            },
            {
              label: 'Age',
              value: `${this.calculateAge(response.dateOfBirth)} years`,
            },
          ],
        },
        {
          title: 'Contact Information',
          icon: this.icons.COMMON.PHONE,
          fields: [
            {
              label: 'Email',
              value: response.email,
            },
            {
              label: 'Contact Number',
              value: response.contactNumber,
            },
            {
              label: 'Emergency Contact',
              value: response.emergencyContactNumber,
            },
          ],
        },
        {
          title: 'Home Address',
          icon: this.icons.COMMON.HOME,
          fields: [
            {
              label: 'Complete Address',
              value: `${response.houseNumber}, ${response.streetName}, ${response.landmark}, ${response.city}, ${response.state}, ${response.pincode}`,
            },
            {
              label: 'House Number',
              value: response.houseNumber,
            },
            {
              label: 'Street Name',
              value: response.streetName,
            },
            {
              label: 'Landmark',
              value: response.landmark,
            },
            {
              label: 'City',
              value: getMappedValueFromArrayOfObjects(
                this.appConfigurationService.cities(),
                response.city
              ),
            },
            {
              label: 'State',
              value: getMappedValueFromArrayOfObjects(
                this.appConfigurationService.states(),
                response.state
              ),
            },
            {
              label: 'Pin Code',
              value: response.pincode,
            },
          ],
        },
      ],
      [
        {
          title: 'Employment Information',
          icon: this.icons.COMMON.BRIEFCASE,
          fields: [
            {
              label: 'Employee ID',
              value: response.employeeId,
            },
            {
              label: 'Designation',
              value: getMappedValueFromArrayOfObjects(
                this.appConfigurationService.designations(),
                response.designation
              ),
            },
            {
              label: 'Employment Type',
              value: getMappedValueFromArrayOfObjects(
                this.appConfigurationService.employmentTypes(),
                response.employeeType
              ),
            },
            {
              label: 'Date of Joining',
              value: response.dateOfJoining,
              type: EDataType.DATE,
              format: this.appConfigService.dateFormats.DEFAULT,
            },
            {
              label: 'Previous Experience',
              value: response.previousExperience,
            },
            {
              label: 'Role',
              value: response.roles,
            },
            {
              label: 'ESIC Number',
              value: response.esicNumber,
            },
            {
              label: 'UAN Number',
              value: response.uanNumber,
            },
          ],
        },
      ],
      [
        {
          title: 'Educational Information',
          icon: this.icons.COMMON.BOOK,
          fields: [
            {
              label: 'Degree',
              value: response.degree
                ? getMappedValueFromArrayOfObjects(
                    this.appConfigurationService.degrees(),
                    response.degree
                  )
                : '',
            },
            {
              label: 'Branch',
              value: response.branch
                ? getMappedValueFromArrayOfObjects(
                    this.appConfigurationService.branches(),
                    response.branch
                  )
                : '',
            },
            {
              label: 'Passing Year',
              value: response.passoutYear,
            },
          ],
        },
      ],
      [
        {
          title: 'Bank Information',
          icon: this.icons.COMMON.CREDIT_CARD,
          fields: [
            {
              label: 'Bank Name',
              value: response.bankName
                ? getMappedValueFromArrayOfObjects(
                    this.appConfigurationService.bankNames(),
                    response.bankName
                  )
                : '',
            },
            {
              label: 'Account Holder Name',
              value: response.bankHolderName,
            },
            {
              label: 'Account Number',
              value: response.accountNumber,
            },
            {
              label: 'IFSC Code',
              value: response.ifscCode,
            },
          ],
        },
      ],
      [
        {
          title: 'Identity Documents',
          icon: this.icons.COMMON.FILE,
          fields: [
            {
              label: 'Aadhar Number',
              value: response.aadharNumber,
            },
            {
              label: 'PAN Number',
              value: response.panNumber,
            },
            {
              label: 'Driving License',
              value: response.dlNumber,
            },
            {
              label: 'Passport Number',
              value: response.passportNumber,
            },
          ],
        },
      ],
    ];

    const {
      AADHAR,
      PAN,
      PASSPORT,
      DRIVING_LICENSE,
      ESIC,
      UAN,
      DEGREE,
      OFFER_LETTER,
      EXPERIENCE_LETTER,
      allDocumentKeys,
    } = response.documents;

    const documentInfo: IEmployeeDocumentInfo[] = [
      {
        label: 'Aadhar Document',
        documentKey: AADHAR,
        color: 'red',
      },
      {
        label: 'PAN Document',
        documentKey: PAN,
        color: 'blue',
      },
      {
        label: 'Passport Document',
        documentKey: PASSPORT,
        color: 'green',
      },
      {
        label: 'Driving License Document',
        documentKey: DRIVING_LICENSE,
        color: 'purple',
      },
      {
        label: 'ESIC Document',
        documentKey: ESIC,
        color: 'red',
      },
      {
        label: 'UAN Document',
        documentKey: UAN,
        color: 'yellow',
      },
      {
        label: 'Degree Document',
        documentKey: DEGREE,
        color: 'blue',
      },
      {
        label: 'Offer Letter Document',
        documentKey: OFFER_LETTER,
        color: 'yellow',
      },
      {
        label: 'Experience Letter Document',
        documentKey: EXPERIENCE_LETTER,
        color: 'purple',
      },
    ];

    const auditInfo: IEmployeeAuditItem[] = [];

    // Add Created info (always present)
    if (response.createdAt) {
      auditInfo.push({
        label: 'Created',
        name:
          response.createdByUser?.firstName || response.createdByUser?.lastName
            ? `${response.createdByUser?.firstName ?? ''} ${response.createdByUser?.lastName ?? ''}`.trim() ||
              null
            : null,
        date: response.createdAt,
        icon: this.icons.COMMON.ADD,
        iconColor: 'text-blue-500',
      });
    }

    if (response.updatedAt) {
      auditInfo.push({
        label: 'Updated',
        name:
          response.updatedByUser?.firstName || response.updatedByUser?.lastName
            ? `${response.updatedByUser?.firstName ?? ''} ${response.updatedByUser?.lastName ?? ''}`.trim() ||
              null
            : null,
        date: response.updatedAt,
        icon: this.icons.ACTIONS.EDIT,
        iconColor: 'text-green-500',
      });
    }

    return {
      basicInfo: employeeBasicInfo,
      quickInfo,
      employeeDetail,
      documentInfo,
      allDocumentKeys,
      auditInfo,
    };
  }

  private getTabs(): ITabItem[] {
    return [
      {
        route: 'personal',
        label: 'Personal',
        icon: this.icons.COMMON.ID_CARD,
      },
      {
        route: 'employment',
        label: 'Employment',
        icon: this.icons.COMMON.BRIEFCASE,
      },
      {
        route: 'education',
        label: 'Academic',
        icon: this.icons.COMMON.BOOK,
      },
      {
        route: 'bank',
        label: 'Bank',
        icon: this.icons.COMMON.CREDIT_CARD,
      },
      {
        route: 'documents',
        label: 'Documents',
        icon: this.icons.COMMON.FILE,
      },
    ];
  }

  protected viewAttachment(fileKeys: string[]): void {
    if (fileKeys.length === 0) {
      return;
    }

    const media: IGalleryInputData[] = fileKeys.map((key: string) => ({
      mediaKey: key,
    }));

    this.galleryService.show(media);
  }

  protected calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) {
      return 0;
    }
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  protected getAvatarUrl(name: string): string {
    return this.avatarService.getAvatarFromName(name);
  }

  protected getViewAllDocumentsButtonConfig(): Partial<IButtonConfig> {
    return {
      id: EButtonActionType.VIEW,
      label: 'View All',
      icon: this.icons.COMMON.TH_LARGE,
      variant: EButtonVariant.OUTLINED,
    };
  }

  protected onTabChanged(event: ITabChange): void {
    this.activeTabIndex.set(event.index);
  }

  override onDrawerHide(): void {
    const currentUrl = this.router.url;
    const urlTree = this.router.parseUrl(currentUrl);

    if (urlTree.queryParams && 'tab' in urlTree.queryParams) {
      delete urlTree.queryParams['tab'];
      void this.router.navigateByUrl(urlTree, { replaceUrl: true });
    }

    super.onDrawerHide();
  }
}
