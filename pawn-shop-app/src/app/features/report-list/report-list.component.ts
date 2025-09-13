import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TranslatePipe } from '../../services/pipes/translate.pipe';
import { ReportService } from '../../services/ReportService';

export interface ReportItem {
  no: number;
  customerName: string;
  customerNRC: string;
  itemType: string;
  amount: number;
  pawnDate: Date;
  dueDate: Date;
  checkedOutDate: Date | null;
  checkedOutBy: string | null;
}

export interface ReportFilter {
  customerName?: string;
  customerNRC?: string;
  itemType?: string;
  minAmount?: number;
  maxAmount?: number;
  pawnDateFrom?: Date;
  pawnDateTo?: Date;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  checkedOutDateFrom?: Date;
  checkedOutDateTo?: Date;
  checkedOutBy?: string;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.css']
})
export class ReportListComponent implements OnInit {
  reportItems: ReportItem[] = [];
  filteredItems: ReportItem[] = [];
  loading = false;
  
  // Search and Filter
  searchTerm = '';
  showAdvancedSearch = false;
  advancedSearchForm!: FormGroup;
  
  // Pagination
  pagination: PaginationInfo = {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  };
  
  pageSizeOptions = [10, 25, 50, 100];
  
  // Sorting
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Item types for dropdown
  itemTypes = ['Jewelry', 'Electronics', 'Tools', 'Vehicles', 'Documents', 'Other'];
Math: any;

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService
  ) {
    this.initializeAdvancedSearchForm();
    this.loadMockData(); // Remove this when connecting to real API
  }

  ngOnInit(): void {
    this.loadReportData();
  }

  private initializeAdvancedSearchForm(): void {
    this.advancedSearchForm = this.fb.group({
      customerName: [''],
      customerNRC: [''],
      itemType: [''],
      minAmount: [''],
      maxAmount: [''],
      pawnDateFrom: [''],
      pawnDateTo: [''],
      dueDateFrom: [''],
      dueDateTo: [''],
      checkedOutDateFrom: [''],
      checkedOutDateTo: [''],
      checkedOutBy: ['']
    });
  }

  private loadMockData(): void {
    // Mock data - replace with actual service call
    this.reportItems = [
      {
        no: 1,
        customerName: 'John Doe',
        customerNRC: '12/ABC(N)123456',
        itemType: 'Jewelry',
        amount: 50000,
        pawnDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-15'),
        checkedOutDate: new Date('2024-02-10'),
        checkedOutBy: 'Admin User'
      },
      {
        no: 2,
        customerName: 'Jane Smith',
        customerNRC: '14/DEF(N)789012',
        itemType: 'Electronics',
        amount: 75000,
        pawnDate: new Date('2024-01-20'),
        dueDate: new Date('2024-02-20'),
        checkedOutDate: null,
        checkedOutBy: null
      },
      {
        no: 3,
        customerName: 'Mike Johnson',
        customerNRC: '9/GHI(N)345678',
        itemType: 'Tools',
        amount: 30000,
        pawnDate: new Date('2024-01-25'),
        dueDate: new Date('2024-02-25'),
        checkedOutDate: new Date('2024-02-22'),
        checkedOutBy: 'Staff User'
      },
      {
        no: 4,
        customerName: 'Sarah Wilson',
        customerNRC: '1/JKL(N)901234',
        itemType: 'Jewelry',
        amount: 120000,
        pawnDate: new Date('2024-02-01'),
        dueDate: new Date('2024-03-01'),
        checkedOutDate: null,
        checkedOutBy: null
      },
      {
        no: 5,
        customerName: 'David Brown',
        customerNRC: '7/MNO(N)567890',
        itemType: 'Vehicles',
        amount: 200000,
        pawnDate: new Date('2024-02-05'),
        dueDate: new Date('2024-03-05'),
        checkedOutDate: null,
        checkedOutBy: null
      }
    ];
    
    this.filteredItems = [...this.reportItems];
    this.updatePagination();
  }

  loadReportData(): void {
    this.loading = true;
    
    // Replace with actual service call
    setTimeout(() => {
      this.applyFilters();
      this.loading = false;
    }, 500);
  }

  onSearch(): void {
    this.applyFilters();
    this.pagination.currentPage = 1;
  }

  onAdvancedSearch(): void {
    this.applyFilters();
    this.pagination.currentPage = 1;
  }

  clearAdvancedSearch(): void {
    this.advancedSearchForm.reset();
    this.applyFilters();
    this.pagination.currentPage = 1;
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  private applyFilters(): void {
    let filtered = [...this.reportItems];
    
    // Basic search
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.customerName.toLowerCase().includes(term) ||
        item.customerNRC.toLowerCase().includes(term) ||
        item.itemType.toLowerCase().includes(term) ||
        (item.checkedOutBy?.toLowerCase().includes(term) || false)
      );
    }
    
    // Advanced search
    const formValues = this.advancedSearchForm.value;
    if (formValues.customerName) {
      filtered = filtered.filter(item =>
        item.customerName.toLowerCase().includes(formValues.customerName.toLowerCase())
      );
    }
    
    if (formValues.customerNRC) {
      filtered = filtered.filter(item =>
        item.customerNRC.toLowerCase().includes(formValues.customerNRC.toLowerCase())
      );
    }
    
    if (formValues.itemType) {
      filtered = filtered.filter(item => item.itemType === formValues.itemType);
    }
    
    if (formValues.minAmount) {
      filtered = filtered.filter(item => item.amount >= formValues.minAmount);
    }
    
    if (formValues.maxAmount) {
      filtered = filtered.filter(item => item.amount <= formValues.maxAmount);
    }
    
    // Date filters
    if (formValues.pawnDateFrom) {
      filtered = filtered.filter(item => item.pawnDate >= new Date(formValues.pawnDateFrom));
    }
    
    if (formValues.pawnDateTo) {
      filtered = filtered.filter(item => item.pawnDate <= new Date(formValues.pawnDateTo));
    }
    
    if (formValues.dueDateFrom) {
      filtered = filtered.filter(item => item.dueDate >= new Date(formValues.dueDateFrom));
    }
    
    if (formValues.dueDateTo) {
      filtered = filtered.filter(item => item.dueDate <= new Date(formValues.dueDateTo));
    }
    
    if (formValues.checkedOutBy) {
      filtered = filtered.filter(item =>
        item.checkedOutBy?.toLowerCase().includes(formValues.checkedOutBy.toLowerCase()) || false
      );
    }
    
    this.filteredItems = filtered;
    this.updatePagination();
  }

  sort(column: keyof ReportItem): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    this.filteredItems.sort((a, b) => {
      let aValue = a[column];
      let bValue = b[column];
      
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '↕️';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  // Pagination methods
  updatePagination(): void {
    this.pagination.totalItems = this.filteredItems.length;
    this.pagination.totalPages = Math.ceil(this.pagination.totalItems / this.pagination.pageSize);
    
    if (this.pagination.currentPage > this.pagination.totalPages) {
      this.pagination.currentPage = Math.max(1, this.pagination.totalPages);
    }
  }

  getPaginatedItems(): ReportItem[] {
    const startIndex = (this.pagination.currentPage - 1) * this.pagination.pageSize;
    const endIndex = startIndex + this.pagination.pageSize;
    return this.filteredItems.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.pagination.totalPages) {
      this.pagination.currentPage = page;
    }
  }

  changePageSize(newSize: number): void {
    this.pagination.pageSize = newSize;
    this.pagination.currentPage = 1;
    this.updatePagination();
  }

  getPageNumbers(): number[] {
    const totalPages = this.pagination.totalPages;
    const currentPage = this.pagination.currentPage;
    const delta = 2;
    
    const range = [];
    const rangeWithDots = [];
    
    for (let i = Math.max(2, currentPage - delta);
         i <= Math.min(totalPages - 1, currentPage + delta);
         i++) {
      range.push(i);
    }
    
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, -1);
    } else {
      rangeWithDots.push(1);
    }
    
    rangeWithDots.push(...range);
    
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push(-1, totalPages);
    } else {
      if (totalPages > 1) rangeWithDots.push(totalPages);
    }
    
    return rangeWithDots;
  }

  // Export methods
  exportToExcel(): void {
    this.loading = true;
    
    // Prepare export data with current filters and pagination settings
    const exportData = {
      filters: {
        searchTerm: this.searchTerm,
        advancedFilters: this.advancedSearchForm.value
      },
      pagination: this.pagination,
      sortColumn: this.sortColumn,
      sortDirection: this.sortDirection
    };
    
    // Call service to export data
    // this.reportService.exportToExcel(exportData).subscribe({
    //   next: (response) => {
    //     this.downloadFile(response, 'pawn-reports.xlsx');
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     console.error('Export failed:', error);
    //     this.loading = false;
    //   }
    // });
    
    // Mock export - replace with actual service call
    setTimeout(() => {
      console.log('Exporting to Excel with data:', exportData);
      this.loading = false;
      alert('Export functionality would be implemented here');
    }, 1000);
  }

  exportCurrentPage(): void {
    const currentPageData = this.getPaginatedItems();
    console.log('Exporting current page:', currentPageData);
    alert('Export current page functionality would be implemented here');
  }

  exportFilteredData(): void {
    console.log('Exporting filtered data:', this.filteredItems);
    alert('Export filtered data functionality would be implemented here');
  }

  private downloadFile(data: Blob, filename: string): void {
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Utility methods
  formatDate(date: Date | null): string {
    if (!date) return '-';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(date));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getStatusClass(item: ReportItem): string {
    if (item.checkedOutDate) {
      return 'status-checked-out';
    } else if (new Date(item.dueDate) < new Date()) {
      return 'status-overdue';
    } else if (new Date(item.dueDate).getTime() - new Date().getTime() <= 7 * 24 * 60 * 60 * 1000) {
      return 'status-near-due';
    }
    return 'status-active';
  }

  getStatusText(item: ReportItem): string {
    if (item.checkedOutDate) {
      return 'Checked Out';
    } else if (new Date(item.dueDate) < new Date()) {
      return 'Overdue';
    } else if (new Date(item.dueDate).getTime() - new Date().getTime() <= 7 * 24 * 60 * 60 * 1000) {
      return 'Near Due';
    }
    return 'Active';
  }
}