import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: false, // 🔹 Force Angular to see it as a non-standalone component
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        if (res.accessToken) {
          localStorage.setItem('accessToken', res.accessToken);
          if (res.refreshToken) {
            localStorage.setItem('refreshToken', res.refreshToken);
          }
          this.router.navigate(['/dashboard']); // ✅ Redirect to Dashboard
        } else {
          this.errorMessage = 'Login failed: No token received';
        }
      },
      error: (err) => {
        this.errorMessage = 'Invalid email or password';
        console.error('Login error:', err);
      }
    });
  }
}
