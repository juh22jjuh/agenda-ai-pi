import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { NavbarAuth } from '../../shared/navbar-auth/navbar-auth';
import { Footer } from '../../shared/footer/footer';
import { RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { Auth } from '../../auth/auth';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-pre-scheduling',
  standalone: true,
  imports: [
    NavbarAuth,
    Footer,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './pre-scheduling.html'
})
export class PreScheduling implements OnInit {
  empresa: any = null;
  loading = true;
  getServicesEntreprenuer: any = [];
  logged = false;
  selectedService: any = null;
  selectedServiceId: string | null = null;
  workingHours: any[] = [];
  userId: string | null = null;
  showForm: boolean = false;
  isUserActive: boolean = true;
  
  constructor(
    private auth: Auth,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private http: HttpClient,
    private nav: Router
  ) {}

  
  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    this.logged = true;

    await Promise.all([
      this.loadEntrepreneurs(id),
      this.loadServicesEntrepreneur(id)
    ]);

    const { user } = this.auth.getUserData();
    this.userId = user?._id;

    if (user) {
      this.isUserActive = user.isActive;
      const deactivatedUntil = user.deactivatedUntil ? new Date(user.deactivatedUntil) : null;

      if (!this.isUserActive && deactivatedUntil && new Date() > deactivatedUntil) {
        try {
          await firstValueFrom(this.http.put(`${environment.apiUrl}/admin/users/${this.userId}/activate`, {}));
          this.isUserActive = true;
        } catch (error) {
          console.error('Failed to reactivate user:', error);
        }
      }
    }

    this.cdRef.detectChanges();
  }

  async loadServicesEntrepreneur(id: string | null) {
    if (!id) return;
    this.loading = true;

    this.http.get<any[]>(`${environment.apiUrl}/servicesEntreprenuer/getAll/${id}`).subscribe({
      next: (result) => {
        this.getServicesEntreprenuer = result || [];
        this.finishLoading();
      },
      error: (err) => {
        console.error('Erro ao buscar serviços:', err);
        this.getServicesEntreprenuer = [];
        this.finishLoading();
      }
    });
  }

  async loadEntrepreneurs(id: string | null) {
    if (!id) return;
    this.loading = true;

    this.http.get<any>(`${environment.apiUrl}/entrepreneur/entrepreneur/${id}`).subscribe({
      next: (result) => {
        this.empresa = result?.[0] || null;
        this.finishLoading();
      },
      error: (err) => {
        console.error('Erro ao buscar empresa:', err);
        this.empresa = null;
        this.finishLoading();
      }
    });
  }

  private finishLoading() {
    this.loading = false;
    this.cdRef.detectChanges();
  }

  agendar(service: any) {
    const id = this.route.snapshot.paramMap.get('id');
    this.nav.navigate(['establishment/scheduling/', service._id, this.userId, id]);
  }
}