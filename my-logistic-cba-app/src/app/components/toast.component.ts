import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../services/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toasts"
        class="toast"
        [class.toast-success]="toast.type === 'success'"
        [class.toast-error]="toast.type === 'error'"
        [class.toast-warning]="toast.type === 'warning'"
        [class.toast-info]="toast.type === 'info'"
      >
        <div class="toast-icon">
          <svg *ngIf="toast.type === 'success'" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <svg *ngIf="toast.type === 'error'" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <svg *ngIf="toast.type === 'warning'" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <svg *ngIf="toast.type === 'info'" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <button class="toast-close" (click)="removeToast(toast.id)">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      background: white;
      border-left: 4px solid;
      animation: slideIn 0.3s ease-out;
      min-width: 300px;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-success {
      border-left-color: #10b981;
      background: #f0fdf4;
    }

    .toast-success .toast-icon {
      color: #10b981;
    }

    .toast-error {
      border-left-color: #ef4444;
      background: #fef2f2;
    }

    .toast-error .toast-icon {
      color: #ef4444;
    }

    .toast-warning {
      border-left-color: #f59e0b;
      background: #fffbeb;
    }

    .toast-warning .toast-icon {
      color: #f59e0b;
    }

    .toast-info {
      border-left-color: #3b82f6;
      background: #eff6ff;
    }

    .toast-info .toast-icon {
      color: #3b82f6;
    }

    .toast-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }

    .toast-message {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
    }

    .toast-close {
      flex-shrink: 0;
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      color: #9ca3af;
      display: flex;
      align-items: center;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .toast-close:hover {
      background: rgba(0, 0, 0, 0.05);
      color: #374151;
    }

    @media (max-width: 640px) {
      .toast-container {
        left: 20px;
        right: 20px;
        max-width: none;
      }

      .toast {
        min-width: auto;
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private destroy$ = new Subject<void>();
  private timeoutMap = new Map<number, any>();

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toasts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(toast => {
        this.toasts.push(toast);

        // Auto-remove after duration con cleanup apropiado
        if (toast.duration && toast.duration > 0) {
          const timeoutId = setTimeout(() => {
            this.removeToast(toast.id);
            this.timeoutMap.delete(toast.id);
          }, toast.duration);

          // Guardar referencia al timeout para poder cancelarlo después
          this.timeoutMap.set(toast.id, timeoutId);
        }
      });
  }

  ngOnDestroy() {
    // Cancelar todos los timeouts pendientes
    this.timeoutMap.forEach(timeoutId => clearTimeout(timeoutId));
    this.timeoutMap.clear();

    // Completar el subject para unsubscribe
    this.destroy$.next();
    this.destroy$.complete();
  }

  removeToast(id: number) {
    // Cancelar timeout si existe
    const timeoutId = this.timeoutMap.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeoutMap.delete(id);
    }

    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
