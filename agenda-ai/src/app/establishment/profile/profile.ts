
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EstablishmentService } from '../establishment.service';
import { IEntrepreneur } from '../../auth/types/entrepreneur.type';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { NavbarEsta } from '../../shared/navbar-esta/navbar-esta';
import { Footer } from '../../shared/footer/footer';
import { forkJoin, of, throwError } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, CardModule, ButtonModule, ProgressSpinnerModule,
    NavbarEsta, Footer, TableModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {

  entrepreneur: any = null;
  services: any[] = [];
  schedules: any[] = [];

  loading = true;
  errorMessage: string | null = null;

  constructor(
    private establishmentService: EstablishmentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const userString = localStorage.getItem('user_logged');

    if (!userString) {
      this.handleAuthError("Usuário não autenticado. Faça login novamente.");
      return;
    }

    try {
      const user = JSON.parse(userString);
      const userId = user?._id;

      if (!userId) {
        this.handleAuthError("ID do usuário não encontrado. Faça login novamente.");
        return;
      }

      this.establishmentService.getEntrepreneurData(userId).pipe(
        tap(data => {
          this.entrepreneur = data;
          if (!data._id) {
            throw new Error("ID do empreendedor não encontrado.");
          }
        }),
        switchMap(data => {
          const entrepreneurId = data._id!;
          return forkJoin({
            services: this.establishmentService.getServices(entrepreneurId),
            schedules: this.establishmentService.getSchedules(entrepreneurId)
          });
        }),
        catchError(err => {
          // Trata erros da busca inicial de perfil ou da falta de ID
          if (err.status === 404 && err.error?.exists === false) {
            this.router.navigate(['/establishment/register']);
            return of(null); // Para o fluxo
          }
          this.handleDataError(err, 'Ocorreu um erro ao buscar os dados do perfil.');
          return throwError(() => err);
        })
      ).subscribe({
        next: (result) => {
          if (result) {
            this.services = result.services;
            this.schedules = result.schedules;
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
            // Erros das chamadas forkJoin (serviços/agendamentos)
            this.handleDataError(err, 'Ocorreu um erro ao buscar serviços e agendamentos.');
        }
      });

    } catch (error) {
      this.handleAuthError("Erro ao processar dados do usuário. Faça login novamente.");
    }
  }

  private handleDataError(err: any, defaultMessage: string): void {
    this.errorMessage = err.error?.message || err.message || defaultMessage;
    this.loading = false;
    this.cdr.detectChanges();
  }

  private handleAuthError(message: string): void {
    this.errorMessage = message;
    this.loading = false;
    this.router.navigate(['/auth/login']);
    this.cdr.detectChanges();
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
