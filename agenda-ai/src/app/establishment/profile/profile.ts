
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
    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.errorMessage = "ID do usuário não encontrado. Por favor, faça login novamente.";
      this.loading = false;
      this.router.navigate(['/auth/login']);
      return;
    }

    this.establishmentService.getEntrepreneurData(userId).subscribe({
      next: (data) => {
        this.entrepreneur = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Ocorreu um erro ao buscar os dados do perfil.';
        if (err.status === 404) {
          // Se o perfil não existe, redireciona para a página de registro
          this.router.navigate(['/establishment/register']);
        } else {
          this.loading = false;
        }
      }
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
