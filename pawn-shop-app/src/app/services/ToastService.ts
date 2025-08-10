// toast.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  details?: any;
  duration?: number;
  timestamp: number;
    timeoutId?: any;

}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  constructor() { }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  showSuccess(title: string, message: string, details?: any, duration: number = 4000): void {
    this.addToast({
      id: this.generateId(),
      type: 'success',
      title,
      message,
      details,
      duration,
      timestamp: Date.now()
    });
  }

  showError(title: string, message: string, duration: number = 6000): void {
    this.addToast({
      id: this.generateId(),
      type: 'error',
      title,
      message,
      duration,
      timestamp: Date.now()
    });
  }

  showInfo(title: string, message: string, duration: number = 4000): void {
    this.addToast({
      id: this.generateId(),
      type: 'info',
      title,
      message,
      duration,
      timestamp: Date.now()
    });
  }

  showWarning(title: string, message: string, duration: number = 5000): void {
    this.addToast({
      id: this.generateId(),
      type: 'warning',
      title,
      message,
      duration,
      timestamp: Date.now()
    });
  }

  private addToast(toast: ToastMessage): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    // Auto remove toast after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, toast.duration);
    }
  }

  removeToast(id: string): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== id));
  }

  clearAll(): void {
    this.toastsSubject.next([]);
  }
}