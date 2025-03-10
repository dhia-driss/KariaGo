import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/auth'; // Update with your backend URL

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res) => {
        if (res.accessToken) {
          localStorage.setItem('accessToken', res.accessToken);
        }
        if (res.refreshToken) {
          localStorage.setItem('refreshToken', res.refreshToken);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  refreshAccessToken(): Observable<AuthResponse | null> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.logout();
      return of(null);
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { token: refreshToken }).pipe(
      tap((res) => {
        if (res.accessToken) {
          localStorage.setItem('accessToken', res.accessToken);
        }
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken'); // ✅ Returns true if logged in
  }
}
