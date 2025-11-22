import { Component , ChangeDetectorRef, type OnInit} from '@angular/core';
import { inject } from '@angular/core';
import { Establishment } from '../../establishment/establishment';
import { CommonModule } from '@angular/common';
import { NavbarAdm } from '../navbar-adm/navbar-adm';
import { Footer } from '../../shared/footer/footer';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { firstValueFrom } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
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
    HttpClientModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './companies.html'
})
export class Companies implements OnInit{
  empresas: any[] = [];
  loading = true;
  private messageService = inject(MessageService);
 
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef ) { }

  async ngOnInit() {
    await this.loadEntreprenuers()
  }

  async loadEntreprenuers() {
    try {
      const data = await firstValueFrom(
        this.http.get<{empresas: any[]}>(`${environment.apiUrl}/entrepreneur/entreprenuers`)
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
}
