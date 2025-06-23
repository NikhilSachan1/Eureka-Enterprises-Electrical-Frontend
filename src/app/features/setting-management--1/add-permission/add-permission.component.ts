import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PermissionService, Permission, Module } from '../../../core/services/permission.service';
import { LoggerService } from '../../../core/services/logger.service';
import { ROUTE_BASE_PATHS, ROUTES } from '../../../shared/constants';

@Component({
  selector: 'app-add-permission',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    SelectModule,
    InputTextModule,
    TextareaModule,
    FloatLabelModule,
    ToastModule,
    PageHeaderComponent
  ],
  templateUrl: './add-permission.component.html',
  styleUrls: ['./add-permission.component.scss'],
  providers: [MessageService]
})
export class AddPermissionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly permissionService = inject(PermissionService);
  private readonly logger = inject(LoggerService);
  private readonly messageService = inject(MessageService);

  // Form
  permissionForm: FormGroup;

  // Signal-based reactive state
  private readonly _saving = signal<boolean>(false);

  // Computed properties
  readonly saving = computed(() => this._saving());
  readonly loading = computed(() => this.permissionService.loading());
  readonly modules = computed(() => this.permissionService.modules());

  // Module options for dropdown
  readonly moduleOptions = computed(() => 
    this.modules().map(module => ({
      label: module.name,
      value: module.id
    }))
  );

  constructor() {
    this.permissionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      module: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.logger.info('Add Permission Component initialized');
  }

  onSubmit(): void {
    if (this.permissionForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formData = this.permissionForm.value;
    this._saving.set(true);

    const newPermission: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      module: formData.module
    };

    this.permissionService.createPermission(newPermission).subscribe({
      next: (permission) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Permission "${permission.name}" created successfully`
        });
        
        this.logger.info('Permission created successfully', permission);
        
        // Navigate back to permission list after short delay
        setTimeout(() => {
          this.router.navigate([`/${ROUTE_BASE_PATHS.PERMISSION}/${ROUTES.PERMISSION.LIST}`]);
        }, 1500);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create permission. Please try again.'
        });
        this.logger.error('Failed to create permission', error);
      },
      complete: () => this._saving.set(false)
    });
  }

  onCancel(): void {
    this.router.navigate([`/${ROUTE_BASE_PATHS.PERMISSION}/${ROUTES.PERMISSION.LIST}`]);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.permissionForm.controls).forEach(key => {
      const control = this.permissionForm.get(key);
      control?.markAsTouched();
    });
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const control = this.permissionForm.get(fieldName);
    return control ? (control.invalid && (control.dirty || control.touched)) : false;
  }

  getFieldError(fieldName: string): string {
    const control = this.permissionForm.get(fieldName);
    if (!control?.errors) return '';

    const errors = control.errors;
    
    if (errors['required']) return `${fieldName} is required`;
    if (errors['minlength']) return `${fieldName} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `${fieldName} must not exceed ${errors['maxlength'].requiredLength} characters`;

    return 'Invalid value';
  }
} 