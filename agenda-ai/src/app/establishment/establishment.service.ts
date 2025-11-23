
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { IEntrepreneur } from '../auth/types/entrepreneur.type'; // Mantendo a interface, pode ser útil

@Injectable({
  providedIn: 'root'
})
export class EstablishmentService {

  private readonly API_URL = 'http://localhost:3000/api/entrepreneur';

  constructor(private http: HttpClient) { }

  // Função para registrar o empreendedor (já existente e corrigida)
  registerEntrepreneur(userId: string, data: FormData): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/register/${userId}`, data).pipe(
      catchError(this.handleError)
    );
  }

  // --- NOVA FUNÇÃO ADICIONADA ---
  getEntrepreneurData(userId: string): Observable<IEntrepreneur> {
    return this.http.get<IEntrepreneur>(`${this.API_URL}/user/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    // Deixando o componente lidar com o erro
    return throwError(() => error);
  }
}
