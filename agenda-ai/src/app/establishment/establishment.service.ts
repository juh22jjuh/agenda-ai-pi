import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IEntrepreneur } from '../auth/types/entrepreneur.type'; // Importe o modelo

@Injectable({
  providedIn: 'root'
})
export class EstablishmentService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Busca os dados da empresa pelo ID DO USUÁRIO
  getEntrepreneurByUserId(userId: string): Observable<IEntrepreneur> {
    return this.http.get<IEntrepreneur>(`${this.apiUrl}/entrepreneur/user/${userId}`);
  }

  // Busca os dados da empresa pelo ID DA EMPRESA
  getEntrepreneurById(id: string): Observable<IEntrepreneur> {
    return this.http.get<IEntrepreneur>(`${this.apiUrl}/entrepreneur/${id}`);
  }

  getServices(entrepreneurId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/servicesEntreprenuer/getall/${entrepreneurId}`);
  }

  getSchedules(entrepreneurId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/scheduling/entrepreneur/${entrepreneurId}`);
  }

  // Atualiza a empresa pelo ID DA EMPRESA
  updateEntrepreneur(id: string, data: FormData): Observable<any> {
    return this.http.patch(`${this.apiUrl}/entrepreneur/update/${id}`, data);
  }

  // Deleta a empresa pelo ID DA EMPRESA
  deleteEntrepreneur(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/entrepreneur/delete/${id}`);
  }

  // Registra uma nova empresa associada a um usuário
  registerEntrepreneur(userId: string, data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/entrepreneur/register/${userId}`, data);
  }
}
