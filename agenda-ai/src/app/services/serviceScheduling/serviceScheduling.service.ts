// services/serviceScheduling/serviceScheduling.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceSchedulingService {
  private http = inject(HttpClient);
  
  // 🟢 CORREÇÃO 1: Usando 'scheduling' como base, conforme o seu backend.
  private baseUrl = 'http://localhost:3000/scheduling'; 

  // ----------------------------------------------------
  // Rota do Backend (Express Router): GET /scheduling/hours/:serviceId/:date
  // ----------------------------------------------------
  getAvailableTimes(serviceId: string, date: string): Observable<any> {
    // 🟢 CORREÇÃO 2: Monta a URL para buscar os horários
    return this.http.get(`${this.baseUrl}/hours/${serviceId}/${date}`);
    // URL Final: http://localhost:3000/scheduling/hours/ID_DO_SERVICO/2025-12-05
  }

  // ----------------------------------------------------
  // Rota do Backend (Express Router): POST /scheduling
  // ----------------------------------------------------
  createScheduling(payload: any): Observable<any> {
    // 🟢 CORREÇÃO 3: O endpoint de criação é a base
    return this.http.post(this.baseUrl, payload);
    // URL Final: http://localhost:3000/scheduling
  }
}