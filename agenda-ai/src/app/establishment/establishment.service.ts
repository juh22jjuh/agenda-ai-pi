
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
    console.error('Ocorreu um erro na API!', error);
    let userMessage = 'Não foi possível realizar a operação. Tente novamente mais tarde.';

    if (error.error instanceof ErrorEvent) {
      userMessage = 'Ocorreu um erro de rede. Verifique sua conexão.';
    } else if (error.status === 404) {
      userMessage = 'O recurso solicitado não foi encontrado.';
    } else if (error.status === 500) {
      userMessage = 'Ocorreu um erro interno no servidor.';
    } else if (error.error && error.error.message) {
        userMessage = error.error.message;
    }
    
    return throwError(() => new Error(userMessage));
  }
}
