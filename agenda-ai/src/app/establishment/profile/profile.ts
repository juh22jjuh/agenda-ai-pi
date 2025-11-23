
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EstablishmentService } from '../establishment.service';
import { IEntrepreneur } from '../../auth/types/entrepreneur.type';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { NavbarEsta } from '../../shared/navbar-esta/navbar-esta';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    NavbarEsta,
    Footer
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {

  entrepreneur: IEntrepreneur | null = null;
  loading = true;
  errorMessage: string | null = null;

  constructor(
    private establishmentService: EstablishmentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const userString = localStorage.getItem('user');

    if (!userString) {
      this.handleAuthError("Usuário não autenticado. Por favor, faça login novamente.");
      return;
    }

    try {
      const user = JSON.parse(userString);
      const userId = user?._id;

      if (!userId) {
        this.handleAuthError("ID do usuário não encontrado. Por favor, faça login novamente.");
        return;
      }

      this.establishmentService.getEntrepreneurData(userId).subscribe({
        next: (data) => {
          this.entrepreneur = data;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          if (err.status === 404 && err.error?.exists === false) {
            this.router.navigate(['/establishment/register']);
          } else {
            this.errorMessage = err.error?.message || err.message || 'Ocorreu um erro ao buscar os dados do perfil.';
          }
        }
      });

    } catch (error) {
      this.handleAuthError("Erro ao processar dados do usuário. Faça login novamente.");
    }
  }

  private handleAuthError(message: string): void {
    this.errorMessage = message;
    this.loading = false;
    this.router.navigate(['/auth/login']);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
