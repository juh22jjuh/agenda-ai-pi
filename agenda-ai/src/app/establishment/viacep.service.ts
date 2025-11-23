
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interface for type-safe response
export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ViacepService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://viacep.com.br/ws/';

  search(cep: string): Observable<ViaCEPResponse | null> {
    // Fetches address data from ViaCEP API
    return this.http.get<ViaCEPResponse>(`${this.API_URL}${cep}/json/`).pipe(
      catchError(error => {
        console.error('Erro ao buscar CEP:', error);
        return of(null); // Return null on error
      })
    );
  }
}
