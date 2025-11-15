import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/toast.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'my-logistic-cba-app';
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Initialize automatic token refresh if user is already logged in
    this.authService.initializeTokenRefresh();
  }
}