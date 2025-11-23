import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { NavbarAdm } from '../navbar-adm/navbar-adm'; 
import { Footer } from '../../shared/footer/footer';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { firstValueFrom } from 'rxjs';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    NavbarAdm, 
    Footer,
    CommonModule,
    ButtonModule,
    ProgressSpinnerModule,
    HttpClientModule,
    FormsModule
  ],
  templateUrl: './users.html',
  providers: [MessageService]
})
export class Users implements OnInit {
  messageService = inject(MessageService)
  users: any[] = [] ;
  loading = true; 

deactivationDays: { [userId: string]: number } = {};

  constructor(private cdr: ChangeDetectorRef, private http: HttpClient) { }

  async ngOnInit() {
    await this.loadUser()
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    // Correção: O backend espera um cabeçalho 'token' com o valor 'Bearer <jwt>'
    return new HttpHeaders().set('token', `Bearer ${token || ''}`);
  }

  async loadUser() {
    try {
      const headers = this.getAuthHeaders();
      const data = await firstValueFrom(
        this.http.get<any[]>(`${environment.apiUrl}/admin/user`, { headers })
      );
      this.users = data ?? [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      this.users = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  deactivateUser(id: string) {
    const days = this.deactivationDays[id];
    if (!days || days <= 0) {
        this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Por favor, insira um número válido de dias para desativação.'
        });
        return;
    }

    const headers = this.getAuthHeaders();
    this.http.put(`${environment.apiUrl}/admin/users/${id}/deactivate`, { deactivationDays: days }, { headers }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Usuário desativado com sucesso!'
        });
        this.loadUser(); // recarrega a lista
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível desativar o usuário.'
        });
      }
    });
  }

  activateUser(id: string) {
    const headers = this.getAuthHeaders();
    this.http.put(`${environment.apiUrl}/admin/users/${id}/activate`, {}, { headers }).subscribe({
        next: () => {
            this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Usuário ativado com sucesso!'
            });
            this.loadUser(); // recarrega a lista
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
