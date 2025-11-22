// services/serviceScheduling/serviceScheduling.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiceSchedulingService {
  private http = inject(HttpClient);
  
  private baseUrl = `${environment.apiUrl}/scheduling`; 

  getAvailableTimes(serviceId: string, date: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/hours/${serviceId}/${date}`);
  }

  createScheduling(payload: any): Observable<any> {
    return this.http.post(this.baseUrl, payload);
  }

  getAvailableDates(serviceId: string, month: number, year: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/dates/${serviceId}?month=${month}&year=${year}`);
  }

  getSchedulingByService(serviceId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/service/${serviceId}`);
  }
}