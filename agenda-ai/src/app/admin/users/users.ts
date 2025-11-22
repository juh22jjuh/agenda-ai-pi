import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { NavbarAdm } from '../navbar-adm/navbar-adm'; 
import { Footer } from '../../shared/footer/footer';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { firstValueFrom } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    NavbarAdm, 
    Footer,
    CommonModule,
    ButtonModule,
    ProgressSpinnerModule,
    HttpClientModule
  ],
  templateUrl: './users.html',
  providers: [MessageService]
})
export class Users implements OnInit {
  messageService = inject(MessageService)
  users: any[] = [] ;
  loading = true; 

  constructor(private cdr: ChangeDetectorRef, private http: HttpClient) { }

  async ngOnInit() {
    await this.loadUser()
  }

  async loadUser() {
    try {
      const data = await firstValueFrom(
        this.http.get<any[]>(`${environment.apiUrl}/user/all`)
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

  alterarStatus(id: string, status: boolean) {
    this.http.patch(`${environment.apiUrl}/api/user/status/${id}`, { isActive: status }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: status ? 'Usuário ativado!' : 'Usuário inativado!'
        });
        this.loadUser(); // recarrega a lista
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
}
