
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

  // Busca todos os serviços de um empreendedor
  getServices(entrepreneurId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/services_entreprenuer/getall/${entrepreneurId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Busca todos os agendamentos de um empreendedor (usando o novo endpoint)
  getSchedules(entrepreneurId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/scheduling/entrepreneur/${entrepreneurId}`).pipe(
      catchError(this.handleError)
    );
  }

  updateService(id: string, dados: any) {
    return this.http.put(`http://localhost:3000/servicesEntreprenuer/update/${id}`, dados);
  }
    
  deleteService(id: string) {
    return this.http.delete(`http://localhost:3000/servicesEntreprenuer/delete/${id}`);
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}
