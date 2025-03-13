import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reclamation } from '../models/reclamation.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReclamationService {
  private apiUrl = `${environment.apiBaseUrl}/reclamations`;

  constructor(private http: HttpClient) {}

  // Get all reclamations
  getAllReclamations(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(this.apiUrl);
  }

  // Get a single reclamation by ID
  getReclamationById(id: string): Observable<Reclamation> {
    return this.http.get<Reclamation>(`${this.apiUrl}/${id}`);
  }

  // Add a new reclamation
  addReclamation(reclamation: Partial<Reclamation>): Observable<Reclamation> {
    return this.http.post<Reclamation>(this.apiUrl, reclamation);
  }

  // Update an existing reclamation
  updateReclamation(id: string, reclamation: Partial<Reclamation>): Observable<Reclamation> {
    return this.http.put<Reclamation>(`${this.apiUrl}/${id}`, reclamation);
  }

  // Delete a reclamation
  deleteReclamation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
