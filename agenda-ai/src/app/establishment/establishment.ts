import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Auth } from '../auth/auth';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { IEntrepreneur } from '../auth/types/entrepreneur.type';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Establishment {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private user = inject(Auth);

  register(data: FormData) { // Changed to accept FormData
    const userData = this.user.getUserData();
    const userId = userData?.user?._id;

    if (!userId) {
      console.error("Usuário não encontrado!");
      return throwError(() => new Error("Usuário não encontrado"));
    }

    // No need to clear localStorage or call getUserById here for registration

    return this.http.post<IEntrepreneur>(
      `http://localhost:3000/entrepreneur/register/${userId}`,
      data // Sending FormData directly
    ).pipe(
      catchError(err => {
        console.error('Erro ao cadastrar estabelecimento:', err);
        return throwError(() => err);
      })
    );
  }

  delete(id: string) {
    return this.http.delete(
      `http://localhost:3000/entrepreneur/delete/${id}`
    ).pipe(
      catchError(err => {
        console.error(err);
        return throwError(() => err);
      })
    );
  }
}
