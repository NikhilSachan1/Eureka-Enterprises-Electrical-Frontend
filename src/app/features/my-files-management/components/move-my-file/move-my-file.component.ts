import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, finalize, Subject } from 'rxjs';
import { TreeNode } from 'primeng/api';
import {
  TreeModule,
  TreeNodeExpandEvent,
  TreeNodeSelectEvent,
} from 'primeng/tree';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { ICONS } from '@shared/constants';
import { DEFAULT_INPUT_FIELD_CONFIG } from '@shared/config/input-field.config';
import { LoadingService, NotificationService } from '@shared/services';
import { EDataType, IInputFieldsConfig } from '@shared/types';
import { MyFilesService } from '../../services/my-files.service';
import {
  IMoveMyFileDrawerData,
  IMyFilesMoveFolderTreeItem,
} from '../../types/my-files.interface';
import {
  IMyFilesMoveFormDto,
  IMyFilesMoveResponseDto,
} from '../../types/my-files.dto';
import { EMyFileType } from '../../types/my-files.enum';

const ROOT_FOLDER_TREE_KEY = 'root';

@Component({
  selector: 'app-move-my-file',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, TreeModule],
  templateUrl: './move-my-file.component.html',
  styleUrl: './move-my-file.component.scss',
})
export class MoveMyFileComponent extends DrawerDetailBase {
  private readonly drawerData = inject(DRAWER_DATA) as IMoveMyFileDrawerData;
  private readonly myFilesService = inject(MyFilesService);
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly searchInputChanges$ = new Subject<string>();

  private excludeFolderId?: string;

  protected readonly searchFieldConfig: IInputFieldsConfig = {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    fieldType: EDataType.TEXT,
    id: 'search',
    fieldName: 'search',
    label: 'Search folders',
    placeholder: 'Search folders...',
  } as IInputFieldsConfig;
  protected readonly searchInput = signal('');
  protected readonly searchTerm = signal('');
  protected readonly folderTreeNodes = signal<TreeNode[]>([]);
  protected selectedFolder: TreeNode | null = null;
  protected readonly moving = signal(false);

  override ngOnInit(): void {
    super.ngOnInit();

    this.searchInputChanges$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(term => {
        this.searchTerm.set(term.trim());
        this.initFolderTree();
      });
  }

  override onDrawerShow(): void {
    this.searchInput.set('');
    this.searchTerm.set('');
    this.initFolderTree();
  }

  protected onSearchFieldChange(value: unknown): void {
    const term = String(value ?? '');
    this.searchInput.set(term);
    this.searchInputChanges$.next(term);
  }

  protected nodeExpand(event: TreeNodeExpandEvent): void {
    this.loadFolderTreeChildren(event.node);
  }

  protected nodeSelect(event: TreeNodeSelectEvent): void {
    if (this.moving()) {
      return;
    }

    const destinationParentId =
      event.node.key === ROOT_FOLDER_TREE_KEY ? null : String(event.node.key);

    this.moveToFolder(destinationParentId);
  }

  protected moveToFolder(destinationParentId: string | null): void {
    if (this.moving()) {
      return;
    }

    const record = this.drawerData.itemToMove;
    const isFolder = record.type === EMyFileType.FOLDER;

    this.moving.set(true);
    this.loadingService.show({
      title: isFolder ? 'Moving Folder' : 'Moving File',
      message: isFolder
        ? "We're moving the folder. This will just take a moment."
        : "We're moving the file. This will just take a moment.",
    });

    const formData: IMyFilesMoveFormDto = { parentId: destinationParentId };

    this.myFilesService
      .moveMyFile(record.id, formData)
      .pipe(
        finalize(() => {
          this.moving.set(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IMyFilesMoveResponseDto) => {
          this.notificationService.success(response.message);
          this.drawerData.onSuccess(destinationParentId);
          this.drawerService.hideDrawer();
        },
        error: error => {
          this.logger.logUserAction('Failed to move file or folder', error);
          this.notificationService.error(
            error?.error?.message ??
              (isFolder
                ? 'Could not move the folder. Please try again.'
                : 'Could not move the file. Please try again.')
          );
        },
      });
  }

  private initFolderTree(): void {
    const record = this.drawerData.itemToMove;
    this.excludeFolderId =
      record.type === EMyFileType.FOLDER ? record.id : undefined;

    this.selectedFolder = null;

    const rootNode: TreeNode = {
      key: ROOT_FOLDER_TREE_KEY,
      label: 'My Files (Root)',
      icon: ICONS.COMMON.HOME,
      leaf: false,
      loading: true,
      expanded: true,
      data: { childrenLoaded: false },
    };

    this.folderTreeNodes.set([rootNode]);
    this.loadFolderTreeChildren(rootNode);
  }

  private loadFolderTreeChildren(node: TreeNode): void {
    if (node.data?.childrenLoaded) {
      return;
    }

    this.updateTreeNode({ ...node, loading: true });

    const parentId =
      node.key === ROOT_FOLDER_TREE_KEY ? null : String(node.key);

    this.myFilesService
      .getMoveFolderTreeItems(
        parentId,
        this.excludeFolderId,
        this.searchTerm() || undefined
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: items => {
          this.updateTreeNode({
            ...node,
            loading: false,
            children: this.mapItemsToTreeNodes(items),
            data: { childrenLoaded: true },
            leaf: node.key !== ROOT_FOLDER_TREE_KEY && items.length === 0,
          });
        },
        error: error => {
          this.logger.logUserAction('Failed to load move folder tree', error);
          this.updateTreeNode({
            ...node,
            loading: false,
            data: { childrenLoaded: true },
            leaf: node.key !== ROOT_FOLDER_TREE_KEY,
          });
          this.notificationService.error(
            'Could not load folders. Please try again.'
          );
        },
      });
  }

  private mapItemsToTreeNodes(items: IMyFilesMoveFolderTreeItem[]): TreeNode[] {
    return items.map(item => ({
      key: item.id,
      label: item.name,
      icon: ICONS.COMMON.FOLDER,
      leaf: false,
      data: { childrenLoaded: false },
    }));
  }

  private updateTreeNode(updatedNode: TreeNode): void {
    const nodeKey = String(updatedNode.key);

    this.folderTreeNodes.set(
      this.replaceNodeByKey(this.folderTreeNodes(), nodeKey, updatedNode)
    );
  }

  private replaceNodeByKey(
    nodes: TreeNode[],
    key: string,
    updatedNode: TreeNode
  ): TreeNode[] {
    return nodes.map(node => {
      if (node.key === key) {
        return updatedNode;
      }

      if (node.children?.length) {
        return {
          ...node,
          children: this.replaceNodeByKey(node.children, key, updatedNode),
        };
      }

      return node;
    });
  }
}
