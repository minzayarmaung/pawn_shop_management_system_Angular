import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { trigger, style, transition, animate } from '@angular/animations';
import { ToastMessage, ToastService } from '../../../services/ToastService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.component.html',
  standalone:true,
  imports:[CommonModule],
  styleUrls: ['./toast-container.component.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(120%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(120%)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private subscription: Subscription = new Subscription();
  private defaultDuration = 5000; // 5 seconds

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.toastService.toasts$.subscribe(toasts => {
        this.toasts = toasts;

        // Auto remove each toast after duration
        toasts.forEach(toast => {
          if (!toast.timeoutId) {
            toast.timeoutId = setTimeout(() => {
              this.removeToast(toast.id);
            }, toast.duration || this.defaultDuration);
          }
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.toasts.forEach(toast => clearTimeout(toast.timeoutId));
  }

  removeToast(id: string): void {
    this.toastService.removeToast(id);
  }

  trackByFn(index: number, item: ToastMessage): string {
    return item.id;
  }
}
