import { Component , ChangeDetectorRef, type OnInit} from '@angular/core';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarAdm } from '../navbar-adm/navbar-adm';
import { Footer } from '../../shared/footer/footer';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { firstValueFrom } from 'rxjs';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Auth } from '../../auth/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [
    NavbarAdm, 
    Footer, 
    CommonModule,  
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    RouterLink,
    RouterLinkActive,
    ConfirmDialog,
    ToastModule,
    FormsModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './companies.html'
})
export class Companies implements OnInit{
  empresas: any[] = [];
  loading = true;
  deactivationDays: { [empresaId: string]: number } = {};
  private messageService = inject(MessageService);
 
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef ) { }

  async ngOnInit() {
    await this.loadEntreprenuers()
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    // Correção: O backend espera um cabeçalho 'token' com o valor 'Bearer <jwt>'
    return new HttpHeaders().set('token', `Bearer ${token || ''}`);
  }

  async loadEntreprenuers() {
    try {
      const headers = this.getAuthHeaders();
      const data = await firstValueFrom(
        this.http.get<{empresas: any[]}>(`${environment.apiUrl}/admin/entrepreneurs`, { headers })
      );
      this.empresas = data?.empresas ?? [];
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      this.empresas = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  alterarStatus(id: string, status: boolean) {
    this.http.patch(`${environment.apiUrl}/api/entrepreneur/status/${id}`, { isActive: status }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: status ? 'Empresa ativada!' : 'Empresa inativada!'
        });
        this.loadEntreprenuers(); // recarrega a lista
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível alterar o status.'
        });
      }
    });
  }

   deactivateEntrepreneur(id: string) {
    const token = localStorage.getItem('token');
    const headersAuth = new HttpHeaders({
      token: `Bearer ${token}`
    });

     const days = this.deactivationDays[id];
    if (!days || days <= 0) {
        this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Por favor, insira um número válido de dias para desativação.'
        });
        return;
    }

    this.http.put(`${environment.apiUrl}/admin/entrepreneurs/${id}/deactivate`, { deactivationDays: days }, { 
      headers: headersAuth
     }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Empresa desativado com sucesso!'
        });
        this.loadEntreprenuers(); // recarrega a lista
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível desativar o empresa.'
        });
      }
    });
  }

  activateEntrepreneur(id: string) {
    const headers = this.getAuthHeaders();
    this.http.put(`${environment.apiUrl}/admin/entrepreneurs/${id}/activate`, {}, { headers }).subscribe({
        next: () => {
            this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Empresa ativado com sucesso!'
            });
            this.loadEntreprenuers(); // recarrega a lista
        },
        error: () => {
            this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Não foi possível ativar o usuário.'
            });
        }
    });
  }
}
