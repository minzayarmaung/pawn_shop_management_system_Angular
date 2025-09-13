import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { PaginationInfo, ReportFilter, ReportItem } from '../features/report-list/report-list.component';

export interface ReportResponse {
  items: ReportItem[];
  pagination: PaginationInfo;
  totalCount: number;
}

export interface ExportRequest {
  filters?: ReportFilter;
  pagination?: PaginationInfo;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  exportType?: 'all' | 'filtered' | 'current';
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor() { }

  /**
   * Get paginated report data with filters
   */
  getReports(
    page: number = 1, 
    pageSize: number = 10, 
    filters?: ReportFilter,
    sortColumn?: string,
    sortDirection?: 'asc' | 'desc'
  ): Observable<ReportResponse> {
    // Mock API call - replace with actual HTTP request
    const mockResponse: ReportResponse = {
      items: this.getMockData(),
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        totalItems: 100,
        totalPages: Math.ceil(100 / pageSize)
      },
      totalCount: 100
    };

    return of(mockResponse).pipe(delay(500));
  }

  /**
   * Export data to Excel
   */
  exportToExcel(exportRequest: ExportRequest): Observable<Blob> {
    // Mock export - in real implementation, this would call your backend API
    return new Observable(observer => {
      setTimeout(() => {
        // Create a mock Excel blob
        const mockExcelData = this.createMockExcelBlob(exportRequest);
        observer.next(mockExcelData);
        observer.complete();
      }, 1000);
    });
  }

  /**
   * Get available filter options
   */
  getFilterOptions(): Observable<{
    itemTypes: string[];
    checkedOutByUsers: string[];
  }> {
    const filterOptions = {
      itemTypes: ['Jewelry', 'Electronics', 'Tools', 'Vehicles', 'Documents', 'Other'],
      checkedOutByUsers: ['Admin User', 'Staff User', 'Manager User']
    };

    return of(filterOptions).pipe(delay(200));
  }

  /**
   * Get report statistics
   */
  getReportStatistics(filters?: ReportFilter): Observable<{
    totalAmount: number;
    totalItems: number;
    overdueItems: number;
    checkedOutItems: number;
    averageAmount: number;
  }> {
    const stats = {
      totalAmount: 125000,
      totalItems: 320,
      overdueItems: 12,
      checkedOutItems: 85,
      averageAmount: 390.63
    };

    return of(stats).pipe(delay(300));
  }

  /**
   * Search customers for autocomplete
   */
  searchCustomers(query: string): Observable<{
    name: string;
    nrc: string;
  }[]> {
    const mockCustomers = [
      { name: 'John Doe', nrc: '12/ABC(N)123456' },
      { name: 'Jane Smith', nrc: '14/DEF(N)789012' },
      { name: 'Mike Johnson', nrc: '9/GHI(N)345678' },
      { name: 'Sarah Wilson', nrc: '1/JKL(N)901234' },
      { name: 'David Brown', nrc: '7/MNO(N)567890' }
    ].filter(customer => 
      customer.name.toLowerCase().includes(query.toLowerCase()) ||
      customer.nrc.toLowerCase().includes(query.toLowerCase())
    );

    return of(mockCustomers).pipe(delay(200));
  }

  private getMockData(): ReportItem[] {
    return [
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
      }
    ];
  }

  private createMockExcelBlob(exportRequest: ExportRequest): Blob {
    // In a real implementation, this would be handled by your backend
    // This is just a mock CSV content for demonstration
    const csvContent = `No,Customer Name,Customer NRC,Item Type,Amount,Pawn Date,Due Date,Checked Out Date,Checked Out By,Status
1,"John Doe","12/ABC(N)123456","Jewelry",50000,"2024-01-15","2024-02-15","2024-02-10","Admin User","Checked Out"
2,"Jane Smith","14/DEF(N)789012","Electronics",75000,"2024-01-20","2024-02-20","","","Active"
3,"Mike Johnson","9/GHI(N)345678","Tools",30000,"2024-01-25","2024-02-25","2024-02-22","Staff User","Checked Out"`;

    return new Blob([csvContent], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  /**
   * Format date for API requests
   */
  private formatDateForAPI(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  /**
   * Build query parameters for API requests
   */
  private buildQueryParams(filters?: ReportFilter, pagination?: PaginationInfo): { [key: string]: any } {
    const params: { [key: string]: any } = {};

    if (pagination) {
      params['page'] = pagination.currentPage;
      params['pageSize'] = pagination.pageSize;
    }

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof ReportFilter];
        if (value !== undefined && value !== null && value !== '') {
          if (key.includes('Date') && value instanceof Date) {
            params[key] = this.formatDateForAPI(value);
          } else {
            params[key] = value;
          }
        }
      });
    }

    return params;
  }
}