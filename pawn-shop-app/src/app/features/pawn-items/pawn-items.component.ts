import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PawnItemService } from '../../services/PawnItemService';
import { ToastService } from '../../services/ToastService';
import { CustomValidators } from '../../shared/commons/validators/customerValidators';
import { TranslatePipe } from "../../services/pipes/translate.pipe";

interface PawnItem {
  id: string; // Make optional for creation
  customerName: string;
  customerPhone: string; // Add this
  customerAddress: string; // Add this
  customerNrc: string;
  category: string;
  amount: number;
  pawnDate: string;
  dueDate: string;
  status: 'Active' | 'Expired' | 'Redeemed' | 'Inactive'; // Make optional for creation
  description: string;
  [key: string]: any; // This allows dynamic properties
  
  // Phone specific properties
  brand?: string;
  model?: string;
  imei?: string;
  storage?: string;
  condition?: string;
  
  // MotoBike specific properties
  make?: string;
  year?: number;
  engine?: string;
  plateNumber?: string;
  mileage?: number;
  
  // Bicycle specific properties
  type?: string;
  frameSize?: string;
  gears?: number;
  wheelSize?: string;
  
  // Watch specific properties
  watchBrand?: string;
  watchModel?: string;
  movement?: string;
  material?: string;
  serialNumber?: string;
  
  // Others
  itemName?: string;
  weight?: number;
  material2?: string;
  color?: string;
}

interface Category {
  value: string;
  label: string;
  icon: string;
}

interface TableColumn {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: string[];
}

@Component({
  selector: 'app-pawn-items',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './pawn-items.component.html',
  styleUrls: ['./pawn-items.component.css']
})
export class PawnItemsComponent implements OnInit {

  successMessage: string | null = null;
  errorMessage: string | null = null;
  isLoading = false;
  responseData: any = null;

  isCheckedOutItems: boolean = false;


    // Auto-hide timers
  private successTimer: any = null;
  private errorTimer: any = null;

  // Data properties
  pawnItems: PawnItem[] = [];
  filteredItems: PawnItem[] = [];
  
  // Filter and search properties
  selectedCategory: string = 'all';
  searchTerm: string = '';
  sortBy: string = 'pawnDate';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  
  // Modal properties
  showModal: boolean = false;
  isEditMode: boolean = false;
  isViewMode: boolean = false;
  formData: any = {};

  pawnForm: FormGroup;
  constructor(private pawnItemService: PawnItemService , private toastService : ToastService , private fb: FormBuilder) {
    this.pawnForm = this.createForm();
  }
    // Create form with validators
  private createForm(): FormGroup {
    return this.fb.group({
      customerName: ['', [Validators.required]],
      customerAddress: ['', [Validators.required]],
      customerNrc: ['', [Validators.required, CustomValidators.nrcValidator()]],
      customerPhone: ['', [Validators.required, CustomValidators.phoneNumberValidator()]],
      category: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      pawnDate: [this.getEmptyFormData().pawnDate, Validators.required],
      dueDate: [this.getEmptyFormData().dueDate, Validators.required],
      description: ['']
    });
  }

    // Get NRC error message
  getNrcErrorMessage(): string {
    const nrcControl = this.pawnForm.get('customerNrc');
    return CustomValidators.getNrcErrorMessage(nrcControl?.errors || null);
  }

  // Get Phone error message  
  getPhoneErrorMessage(): string {
    const phoneControl = this.pawnForm.get('customerPhone');
    return CustomValidators.getPhoneErrorMessage(phoneControl?.errors || null);
  }

  // Mark all fields as touched to show validation errors
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }
  
  // Categories configuration
  categories: Category[] = [
    { value: 'all', label: 'All Items', icon: '📦' },
    { value: 'Phone', label: 'Phone', icon: '📱' },
    { value: 'MotoBike', label: 'MotoBike', icon: '🏍️' },
    { value: 'Bicycle', label: 'Bicycle', icon: '🚲' },
    { value: 'Watches', label: 'Watches', icon: '⌚' },
    { value: 'Others', label: 'Others', icon: '📋' }
  ];
  
  private categoryColumns: { [key: string]: TableColumn[] } = {
  'Phone': [
    {
       key: 'brand', 
       label: 'Brand',
       type: 'select',
       required: true,
       options: ['Redmi' , 'Xiaomi' , 'Samsung' , 'iPhone' , 'Tecno' , 'Vivo' , 'Oppo', 'Itel' , 'Realme' , 'Google Pixel']
      
    },
    { key: 'model', label: 'Model' , required: true},
    { key: 'imei', label: 'IMEI' , required: true },
    { 
      key: 'storage', 
      label: 'Storage', 
      type: 'select', 
      required: true,
      options: ['32GB', '64GB', '128GB', '256GB', '512GB' , '1TB']  
    },
    { 
      key: 'condition', 
      label: 'Condition', 
      type: 'select', 
      required: true,
      options: ['Like New', 'Normal', 'Eco Friendly', 'Just For Parts'] 
    }
  ],
  'MotoBike': [
    { key: 'make', label: 'Make' },
    { key: 'year', label: 'Year', type: 'number' },

    { 
      key: 'engine', 
      label: 'Engine Power',
      type: 'select',
      required: true,
      options:['100' , '110' , '125' , '135' , '150'] 

    },

    { key: 'plateNumber', label: 'Plate Number',  required: true, },
    { key: 'mileage', label: 'Mileage', type: 'number' ,  required: true,}
  ],
  'Bicycle': [
    { key: 'type', label: 'Type' ,  required: true,},
    { key: 'frameSize', label: 'Frame Size'  ,required: true, },
    { key: 'gears', label: 'Gears', type: 'number', required: true, },
    { key: 'wheelSize', label: 'Wheel Size' ,  required: true,},
    { key: 'serialNumber', label: 'Serial Number' ,  required: true },
    { 
      key: 'condition', 
      label: 'Condition', 
      type: 'select', 
      required: true,
      options: ['New', 'Like New', 'Used', 'Needs Repair'] 
    }
  ],
  'Watches': [
    { key: 'watchBrand', label: 'Brand' ,  required: true },
    { key: 'watchModel', label: 'Model' ,  required: true,},
    { key: 'movement', label: 'Movement' ,  required: true,},
    { key: 'material', label: 'Material' ,  required: true,},
    { key: 'serialNumber', label: 'Serial Number',  required: true, }
  ],
  'Others': [
    { key: 'itemName', label: 'Item Name' ,  required: true,},
    { key: 'weight', label: 'Weight', type: 'number' ,  required: true,},
    { key: 'material2', label: 'Material' ,  required: true,},
    { key: 'color', label: 'Color',  required: true, },
    { 
      key: 'condition', 
      label: 'Condition', 
      type: 'select', 
      required: true,
      options: ['New', 'Like New', 'Used', 'Needs Repair'] 
    }
  ]
};
  ngOnInit(): void {
    this.isViewMode = false;
    this.applyFilters();
    this.loadItems();

  }

  // Filter and search methods
  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.loadItems();
    this.applyFilters();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearchChange();
  }

  onSortChange(): void {
    // Update selectedCategory based on sortBy if it's CheckedOutItems
    if (this.sortBy === 'CheckedOutItems') {
      this.selectedCategory = 'all';
    }
    this.loadItems();
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.pawnItems];

    // Apply category filter
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === this.selectedCategory);
    }

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.customerName.toLowerCase().includes(searchLower) ||
        item.id.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'amount':
          return b.amount - a.amount;
        case 'customerName':
          return a.customerName.localeCompare(b.customerName);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'pawnDate':
        default:
          return new Date(b.pawnDate).getTime() - new Date(a.pawnDate).getTime();
      }
    });

    this.filteredItems = filtered;
    this.updatePagination();
  }

  // Pagination methods
  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredItems = this.filteredItems.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  // Utility methods
  getCurrentColumns(): TableColumn[] {
    if (this.selectedCategory === 'all') {
      return []; // Show no dynamic columns when showing all items
    }
    return this.categoryColumns[this.selectedCategory] || [];
  }

  getDynamicColumns(category: string): TableColumn[] {
    return this.categoryColumns[category] || [];
  }

  getCategoryLabel(categoryValue: string): string {
    const category = this.categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  }

  getCategoryIcon(categoryValue: string): string {
    const category = this.categories.find(cat => cat.value === categoryValue);
    return category ? category.icon : '📦';
  }

  getItemProperty(item: PawnItem, key: string): any {
    return (item as any)[key] || '-';
  }

  // Statistics methods
  // Stats calculation methods
  getTotalValue(): number {
    return this.filteredItems.reduce((total, item) => {
      return total + (item.amount || 0);
    }, 0);
  }

  getActiveItems(): number {
    return this.filteredItems.filter(item => 
      item.status && item.status.toLowerCase() === 'active'
    ).length;
  }

  getExpiredItems(): number {
    return this.filteredItems.filter(item => 
      item.status && (item.status.toLowerCase() === 'expired' || item.status.toLowerCase() === 'overdue' || item.status.toLowerCase() === 'inactive')
    ).length;
  }

  // Modal methods
  openCreateModal(): void {
    this.isViewMode = false;
    this.isEditMode = false;

    // Remove all dynamic controls
    Object.values(this.categoryColumns).forEach(categoryColumns => {
      categoryColumns.forEach(column => {
        if (this.pawnForm.get(column.key)) {
          this.pawnForm.removeControl(column.key);
        }
      });
    });

    // Set empty form data with default dates
    this.formData = this.getEmptyFormData();

    // Reset the form with initial values
    this.pawnForm.reset({
      customerName: this.formData.customerName,
      customerPhone: this.formData.customerPhone,
      category: this.formData.category,
      amount: this.formData.amount,
      pawnDate: this.formData.pawnDate, // pre-filled
      dueDate: this.formData.dueDate,   // pre-filled
      description: this.formData.description
    });

    this.showModal = true;
  }


  editItem(item: PawnItem): void {
      this.isViewMode = false;
      this.isEditMode = true;
      
      // Use bracket notation to access details
      const details = item['details'] || {};
      
      // Flatten the item data including details
      this.formData = { 
        ...item, 
        ...details
      };
      
      // Populate the form with the flattened data
      this.populateForm(this.formData);
      this.showModal = true;
    }

  // closeModal(): void {
  //   this.showModal = false;
  //   this.formData = {};
  // }

  // onCategoryChange(category: string): void {
  //   // Remove all existing dynamic form controls
  //   Object.values(this.categoryColumns).forEach(categoryColumns => {
  //     categoryColumns.forEach(column => {
  //       if (this.pawnForm.get(column.key)) {
  //         this.pawnForm.removeControl(column.key);
  //       }
  //     });
  //   });

  //   // Add new form controls for the selected category
  //   const selectedColumns = this.getDynamicColumns(category);
  //   selectedColumns.forEach(column => {
  //     // Use the required property from your configuration
  //     const validators = column.required ? [Validators.required] : [];
  //     this.pawnForm.addControl(column.key, new FormControl('', validators));
  //   });

  //   // Clear the formData for dynamic fields if you're still using it
  //   Object.keys(this.categoryColumns).forEach(cat => {
  //     if (cat !== category) {
  //       this.categoryColumns[cat].forEach(column => {
  //         delete this.formData[column.key];
  //       });
  //     }
  //   });
  // }

  onCategoryChange(category: string, patchData?: any): void {
      // Remove only old controls for the previous category if needed
      Object.values(this.categoryColumns).forEach(categoryColumns => {
        categoryColumns.forEach(column => {
          if (this.pawnForm.get(column.key)) {
            this.pawnForm.removeControl(column.key);
          }
        });
      });

      // Add new controls for the selected category
      const selectedColumns = this.getDynamicColumns(category);
      selectedColumns.forEach(column => {
        const validators = column.required ? [Validators.required] : [];
        this.pawnForm.addControl(column.key, new FormControl('', validators));

        // Patch value immediately if exists
        if (patchData && patchData[column.key] !== undefined) {
          this.pawnForm.get(column.key)?.setValue(patchData[column.key]);
        }
      });
    }

    savePawnItem(): void {
    if (this.pawnForm.valid) {
      this.isLoading = true;

      const formValues = this.pawnForm.value as PawnItem;

      // Create base payload with static fields
      const payload = {
        customerName: formValues.customerName,
        customerPhone: formValues.customerPhone,
        customerNrc: formValues.customerNrc,
        customerAddress: formValues.customerAddress,
        category: formValues.category,
        amount: formValues.amount,
        pawnDate: formValues.pawnDate,
        dueDate: formValues.dueDate,
        description: formValues.description || '',
        details: {} as Record<string, any>
      };

      // Add dynamic fields to details
      this.getDynamicColumns(formValues.category).forEach(col => {
        if (formValues[col.key] !== undefined && formValues[col.key] !== null && formValues[col.key] !== '') {
          payload.details[col.key] = formValues[col.key];
        }
      });

      console.log('Payload being sent:', payload);

      if (this.isEditMode) {
        this.handleUpdateItem(payload);
      } else {
        this.handleCreateItem(payload);
      }
    } else {
      this.markFormGroupTouched(this.pawnForm);
    }
  }

  private handleCreateItem(payload: any): void {
    this.pawnItemService.createPawnItem(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        // Show success toast
        this.toastService.showSuccess(
          'Success!',
          response.message || 'Pawn item created successfully',
          response.data
        );
        // this.closeModal();

        // Refresh items list
        this.loadItems();

        // Close modal immediately on success
        this.closeModal();
      },
      error: (error: any) => {
        this.isLoading = false;
        
        // Extract error message
        let errorMsg = 'An unexpected error occurred';
        if (error.error?.message) {
          errorMsg = error.error.message;
        } else if (error.message) {
          errorMsg = error.message;
        }

        // Show error toast
        this.toastService.showError(
          'Error!',
          errorMsg
        );

        // Keep modal open on error
      }
    });
  }

  private handleUpdateItem(payload: any): void {
    this.pawnItemService.updatePawnItem(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        // Show success toast
        this.toastService.showSuccess(
          'Updated!',
          response.message || 'Pawn item updated successfully',
          response.data
        );

        // Refresh items list
        this.loadItems();

        // Close modal immediately on success
        this.closeModal();
      },
      error: (error: any) => {
        this.isLoading = false;
        
        // Extract error message
        let errorMsg = 'An unexpected error occurred';
        if (error.error?.message) {
          errorMsg = error.error.message;
        } else if (error.message) {
          errorMsg = error.message;
        }

        // Show error toast
        this.toastService.showError(
          'Update Failed!',
          errorMsg
        );
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.isLoading = false;
    this.resetForm();
  }

  private resetForm(): void {
    this.formData = {
      customerName: '',
      customerPhone: '',
      customerNrc: '',
      customerAddress: '',
      category: '',
      amount: 0,
      pawnDate: '',
      dueDate: '',
      description: ''
    };
  }

  
loadItems() {
  this.pawnItemService.getPawnItems(this.selectedCategory, this.sortBy)
    .subscribe(res => {
      const items = Array.isArray(res.data) ? res.data : [];
      this.filteredItems = items.map((i: any) => ({
        id: i.id,
        customerName: i.customerName ?? '',
        customerNrc: i.customerNrc ?? '',
        customerPhone: i.customerPhone ?? '',
        customerAddress: i.customerAddress ?? '',
        category: i.category,
        amount: i.amount,
        pawnDate: i.pawnDate,
        dueDate: i.dueDate,
        status: i.status,
        description: i.description,
        ...i.details
      }));
    });
  }

  viewItem(item: PawnItem): void {
  this.isViewMode = true;
  this.isEditMode = false;
  
  console.log('ViewItem - Full item object:', item);
  console.log('ViewItem - Item keys:', Object.keys(item));
  
  // Since the item is already flattened, you don't need to access details
  this.formData = { ...item };
  
  console.log('ViewItem - FormData:', this.formData);
  console.log('ViewItem - Category value:', this.formData.category);
  console.log('ViewItem - Storage value:', this.formData.storage);
  console.log('ViewItem - Condition value:', this.formData.condition);
  
  console.log(this.formData)
  // Populate the form with the flattened data
  this.populateForm(this.formData);
  this.showModal = true;
}

// viewItem(item: PawnItem): void {
//     this.isViewMode = true;
//     this.isEditMode = false;
    
//     // Use bracket notation to access details
//   console.log('Full item object:', item);
//   console.log('Item keys:', Object.keys(item));
//   console.log('Type of item:', typeof item);
  
//   // Try different ways to access details
//   console.log('item.details (dot notation):', (item as any).details);
//   console.log('item["details"] (bracket notation):', item['details']);
//   console.log('Does item have details property?:', 'details' in item);
  
//   // Use bracket notation to access details
//   const details = item['details'] || {};
//   console.log('details extracted:', details);
//   console.log('details keys:', Object.keys(details));
//     // Flatten the item data including details
//     this.formData = { 
//       ...item, 
//       ...details,
//     };
//     console.log('Condition raw value:', JSON.stringify(item.condition));
//     // Populate the form with the flattened data
//     this.populateForm(this.formData);
//     this.showModal = true;
// }

deleteItem(item: PawnItem): void {
  if (confirm(`Are you sure you want to mark pawn item ${item.id} as inactive?`)) {
    this.pawnItemService.deletePawnItem(item.id)
      .subscribe({
        next: (res) => {
          if (res.success === 1) {
            // Remove it from list without page reload
            this.pawnItems = this.pawnItems.filter(p => p.id !== item.id);
            this.applyFilters();
            alert('Item marked as inactive successfully');
            this.loadItems();
          } else {
            alert('Error: ' + res.message);
          }
        },
        error: () => alert('Failed to update item status')
      });
  }
}

  private getEmptyFormData(): any {
    return {
      customerName: '',
      customerPhone: '',
      category: '',
      amount: 0,
      pawnDate: new Date().toISOString().split('T')[0],
      dueDate: this.getDefaultDueDate(),
      description: ''
    };
  }

  private getDefaultDueDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() + 1); // Default 1 month from now
    return date.toISOString().split('T')[0];
  }

  private generateId(): string {
    const prefix = 'PW';
    const number = (this.pawnItems.length + 1).toString().padStart(3, '0');
    return `${prefix}${number}`;
  }

  onPawnDateChange(): void {
    const pawnDate = new Date(this.formData.pawnDate);
    pawnDate.setDate(pawnDate.getDate() + 30);
    this.formData.dueDate = pawnDate.toISOString().split('T')[0];
  }

  populateForm(data: any): void {
  // First, set the category to trigger dynamic field creation
  this.pawnForm.patchValue({ category: data.category });
  
  // Trigger category change to add dynamic form controls
  this.onCategoryChange(data.category);
  
  // Small delay to ensure dynamic controls are added before patching values
  setTimeout(() => {
    // Now patch all values including dynamic fields
    this.pawnForm.patchValue({
      customerName: data.customerName,
      customerNrc: data.customerNrc,
      customerAddress: data.customerAddress,
      customerPhone: data.customerPhone,
      category: data.category,
      amount: data.amount,
      pawnDate: data.pawnDate,
      dueDate: data.dueDate,
      description: data.description || '',
      condition: data.condition,
      // Dynamic fields will be patched automatically since they're now form controls
      ...this.extractDynamicFields(data)
    });
  }, 0);
}

// Helper method to extract dynamic fields based on category
  extractDynamicFields(data: any): any {
    const dynamicFields: any = {};
    
    if (data.category) {
      const columns = this.getDynamicColumns(data.category);
      columns.forEach(column => {
        if (data[column.key] !== undefined) {
          dynamicFields[column.key] = data[column.key];
        }
      });
    } 
    return dynamicFields;
  }

    // Method to check if we're in checked out items view
  isCheckedOutItemsView(): boolean {
    return this.sortBy === 'CheckedOutItems' || this.selectedCategory === 'CheckedOutItems';
  }

}