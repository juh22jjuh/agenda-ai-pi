import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IServicesEntreprenuer } from '../../auth/types/services_entreprenuer.type';

@Injectable({
  providedIn: 'root'
})
export class ServicesEntreprenuerService {

  private readonly API_URL = 'http://localhost:3000/servicesEntreprenuer'; // Consistent API URL
  private http = inject(HttpClient);

  register(id: string, servicesEntreprenuer: IServicesEntreprenuer): Observable<IServicesEntreprenuer> {
    return this.http.post<IServicesEntreprenuer>(
      `${this.API_URL}/register/${id}`,
      servicesEntreprenuer
    ).pipe(
      catchError(this.handleError)
    );
  }

  getServiceById(id: string): Observable<any> {
    return this.http.get(`${this.API_URL}/get/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  updateService(id: string, dados: any): Observable<any> {
    return this.http.put(`${this.API_URL}/update/${id}`, dados).pipe(
      catchError(this.handleError)
    );
  }
    
  deleteService(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/delete/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Consistent error handler
  private handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => error);
  }
}
