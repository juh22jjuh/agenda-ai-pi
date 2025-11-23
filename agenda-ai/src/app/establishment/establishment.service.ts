
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { IEntrepreneur } from '../auth/types/entrepreneur.type';

@Injectable({
  providedIn: 'root'
})
export class EstablishmentService {

  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  registerEntrepreneur(userId: string, data: FormData): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/entrepreneur/register/${userId}`, data).pipe(
      catchError(this.handleError)
    );
  }

  getEntrepreneurData(userId: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/entrepreneur/user/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  updateEntrepreneur(id: string, data: FormData): Observable<any> {
    return this.http.put(`${this.API_URL}/entrepreneur/update/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  deleteEntrepreneur(userId: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/entrepreneur/delete/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Busca todos os serviços de um empreendedor
  getServices(entrepreneurId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/services_entreprenuer/getall/${entrepreneurId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Busca todos os agendamentos de um empreendedor
  getSchedules(entrepreneurId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/scheduling/entrepreneur/${entrepreneurId}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}
