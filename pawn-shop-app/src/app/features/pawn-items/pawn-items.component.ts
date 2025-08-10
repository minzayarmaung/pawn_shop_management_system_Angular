import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PawnItemService } from '../../services/PawnItemService';
import { ToastContainerComponent } from '../../shared/commons/toast-container/toast-container.component';
import { ToastService } from '../../services/ToastService';

interface PawnItem {
  id: string;
  customerName: string;
  customerPhone: string;
  category: string;
  amount: number;
  pawnDate: string;
  dueDate: string;
  status: 'Active' | 'Expired' | 'Redeemed';
  description?: string;
  
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
  options?: string[];
}

@Component({
  selector: 'app-pawn-items',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pawn-items.component.html',
  styleUrls: ['./pawn-items.component.css']
})
export class PawnItemsComponent implements OnInit {

  successMessage: string | null = null;
  errorMessage: string | null = null;
  isLoading = false;
  responseData: any = null;

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
  formData: any = {};

  constructor(private pawnItemService: PawnItemService , private toastService : ToastService) {}
  
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
       options: ['Redmi' , 'Xiaomi' , 'Samsung' , 'iPhone' , 'Tecno' , 'Vivo' , 'Oppo', 'Itel' , 'Realme' , 'Google Pixel']
      
    },
    { key: 'model', label: 'Model' },
    { key: 'imei', label: 'IMEI' },
    { 
      key: 'storage', 
      label: 'Storage', 
      type: 'select', 
      options: ['32GB', '64GB', '128GB', '256GB', '512GB' , '1TB']  
    },
    { 
      key: 'condition', 
      label: 'Condition', 
      type: 'select', 
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
      options:['100' , '110' , '125' , '135' , '150'] 

    },

    { key: 'plateNumber', label: 'Plate Number' },
    { key: 'mileage', label: 'Mileage', type: 'number' }
  ],
  'Bicycle': [
    { key: 'type', label: 'Type' },
    { key: 'frameSize', label: 'Frame Size' },
    { key: 'gears', label: 'Gears', type: 'number' },
    { key: 'wheelSize', label: 'Wheel Size' },
    { key: 'serialNumber', label: 'Serial Number' },
    { 
      key: 'condition', 
      label: 'Condition', 
      type: 'select', 
      options: ['New', 'Like New', 'Used', 'Needs Repair'] 
    }
  ],
  'Watches': [
    { key: 'watchBrand', label: 'Brand' },
    { key: 'watchModel', label: 'Model' },
    { key: 'movement', label: 'Movement' },
    { key: 'material', label: 'Material' },
    { key: 'serialNumber', label: 'Serial Number' }
  ],
  'Others': [
    { key: 'itemName', label: 'Item Name' },
    { key: 'weight', label: 'Weight', type: 'number' },
    { key: 'material2', label: 'Material' },
    { key: 'color', label: 'Color' },
    { 
      key: 'condition', 
      label: 'Condition', 
      type: 'select', 
      options: ['New', 'Like New', 'Used', 'Needs Repair'] 
    }
  ]
};
  ngOnInit(): void {
    this.applyFilters();
  }

  // // Generate sample data
  // private generateSampleData(): void {
  //   this.pawnItems = [
  //     {
  //       id: 'PW001',
  //       customerName: 'John Doe',
  //       customerPhone: '+95-123-456-789',
  //       category: 'Phone',
  //       amount: 250000,
  //       pawnDate: '2024-01-15',
  //       dueDate: '2024-04-15',
  //       status: 'Active',
  //       brand: 'iPhone',
  //       model: '14 Pro',
  //       imei: '123456789012345',
  //       storage: '256GB',
  //       condition: 'Excellent',
  //       description: 'iPhone 14 Pro in pristine condition'
  //     },
  //     {
  //       id: 'PW002',
  //       customerName: 'Mary Smith',
  //       customerPhone: '+95-987-654-321',
  //       category: 'MotoBike',
  //       amount: 800000,
  //       pawnDate: '2024-01-20',
  //       dueDate: '2024-04-20',
  //       status: 'Active',
  //       make: 'Honda',
  //       year: 2020,
  //       engine: '150cc',
  //       plateNumber: 'AA-1234',
  //       mileage: 25000,
  //       description: 'Honda bike in good condition'
  //     },
  //     {
  //       id: 'PW003',
  //       customerName: 'David Wilson',
  //       customerPhone: '+95-555-123-456',
  //       category: 'Watches',
  //       amount: 500000,
  //       pawnDate: '2024-01-10',
  //       dueDate: '2024-04-10',
  //       status: 'Expired',
  //       watchBrand: 'Rolex',
  //       watchModel: 'Submariner',
  //       movement: 'Automatic',
  //       material: 'Stainless Steel',
  //       serialNumber: 'R123456',
  //       description: 'Authentic Rolex Submariner'
  //     },
  //     {
  //       id: 'PW004',
  //       customerName: 'Sarah Johnson',
  //       customerPhone: '+95-777-888-999',
  //       category: 'Bicycle',
  //       amount: 120000,
  //       pawnDate: '2024-02-01',
  //       dueDate: '2024-05-01',
  //       status: 'Active',
  //       type: 'Mountain Bike',
  //       frameSize: 'Large',
  //       gears: 21,
  //       wheelSize: '26 inch',
  //       condition: 'Good',
  //       description: 'Mountain bike with 21-speed gears'
  //     },
  //     {
  //       id: 'PW005',
  //       customerName: 'Mike Brown',
  //       customerPhone: '+95-333-444-555',
  //       category: 'Others',
  //       amount: 75000,
  //       pawnDate: '2024-01-25',
  //       dueDate: '2024-04-25',
  //       status: 'Redeemed',
  //       itemName: 'Gold Ring',
  //       weight: 15,
  //       material2: '18K Gold',
  //       color: 'Yellow Gold',
  //       condition: 'Excellent',
  //       description: '18K gold ring with intricate design'
  //     }
  //   ];
  // }

  // Filter and search methods
  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1;
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
  getTotalValue(): number {
    return this.pawnItems.reduce((sum, item) => sum + item.amount, 0);
  }

  getActiveItems(): number {
    return this.pawnItems.filter(item => item.status === 'Active').length;
  }

  getExpiredItems(): number {
    return this.pawnItems.filter(item => item.status === 'Expired').length;
  }

  // Modal methods
  openCreateModal(): void {
    this.isEditMode = false;
    this.formData = this.getEmptyFormData();
    this.showModal = true;
  }

  editItem(item: PawnItem): void {
    this.isEditMode = true;
    this.formData = { ...item };
    this.showModal = true;
  }

  // closeModal(): void {
  //   this.showModal = false;
  //   this.formData = {};
  // }

  onCategoryChange(): void {
    // Reset dynamic fields when category changes
    const currentCategory = this.formData.category;
    const columns = this.getDynamicColumns(currentCategory);
    
    // Clear previous category-specific fields
    Object.keys(this.categoryColumns).forEach(category => {
      if (category !== currentCategory) {
        this.categoryColumns[category].forEach(column => {
          delete this.formData[column.key];
        });
      }
    });
  }

  // savePawnItem(): void {
  //   if (this.isEditMode) {
  //     // Update existing item
  //     const index = this.pawnItems.findIndex(item => item.id === this.formData.id);
  //     if (index !== -1) {
  //       this.pawnItems[index] = { ...this.formData };
  //     }
  //   } else {
  //     // Create new item
  //     const newItem: PawnItem = {
  //       ...this.formData,
  //       id: this.generateId(),
  //       status: 'Active' as const
  //     };
  //     this.pawnItems.push(newItem);
  //   }
    
  //   this.closeModal();
  //   this.applyFilters();
  // }

  savePawnItem(): void {
    this.isLoading = true;

    const payload: {
      customerName: string;
      customerPhone: string;
      customerNrc: string;
      customerAddress: string;
      category: string;
      amount: number;
      pawnDate: string;
      dueDate: string;
      description: string;
      details: Record<string, any>;
    } = {
      customerName: this.formData.customerName,
      customerPhone: this.formData.customerPhone,
      customerNrc: this.formData.customerNrc,
      customerAddress: this.formData.customerAddress,
      category: this.formData.category,
      amount: this.formData.amount,
      pawnDate: this.formData.pawnDate,
      dueDate: this.formData.dueDate,
      description: this.formData.description,
      details: {}
    };

    // Add dynamic fields to details
    this.getDynamicColumns(this.formData.category).forEach(col => {
      payload.details[col.key] = this.formData[col.key];
    });

    if (this.isEditMode) {
      this.handleUpdateItem(payload);
    } else {
      this.handleCreateItem(payload);
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
    throw new Error('Method not implemented.');
  }

  viewItem(item: PawnItem): void {
    // Implement view functionality
    console.log('View item:', item);
  }

  deleteItem(item: PawnItem): void {
    if (confirm(`Are you sure you want to delete pawn item ${item.id}?`)) {
      this.pawnItems = this.pawnItems.filter(p => p.id !== item.id);
      this.applyFilters();
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
    date.setMonth(date.getMonth() + 3); // Default 3 months from now
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

}