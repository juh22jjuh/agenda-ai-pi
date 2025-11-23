import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Auth } from '../auth/auth';
import { IEntrepreneur } from '../auth/types/entrepreneur.type';

@Injectable({
  providedIn: 'root'
})
export class EstablishmentService {
  private http = inject(HttpClient);
  private auth = inject(Auth);
  private readonly API_URL = 'http://localhost:3000/entrepreneur';

  register(data: FormData): Observable<IEntrepreneur> {
    const userData = this.auth.getUserData();
    const userId = userData?.user?._id;

    if (!userId) {
      // Returns an Observable that emits an error immediately
      return throwError(() => new Error('ID do usuário não encontrado. Faça o login novamente.'));
    }

    // The backend expects multipart/form-data, so we send FormData directly
    return this.http.post<IEntrepreneur>(`${this.API_URL}/register/${userId}`, data).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    // Centralized error handling for HTTP requests
    console.error('Ocorreu um erro na API!', error.message);
    let userMessage = 'Não foi possível realizar a operação. Tente novamente mais tarde.';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      userMessage = 'Ocorreu um erro de rede. Verifique sua conexão.';
    } else if (error.status === 404) {
      userMessage = 'O recurso solicitado não foi encontrado.';
    } else if (error.status === 500) {
      userMessage = 'Ocorreu um erro interno no servidor.';
    } else if (error.error && error.error.message) {
        userMessage = error.error.message;
    }

    // Return an observable with a user-facing error message
    return throwError(() => new Error(userMessage));
  }
}
