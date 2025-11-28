import { Component , inject, OnInit, ChangeDetectorRef} from '@angular/core';
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
  selector: 'app-complaints',
  standalone: true,
  imports: [
    NavbarAdm, 
    Footer,
    CommonModule,
    ButtonModule,
    ProgressSpinnerModule,
    HttpClientModule
  ], 
  templateUrl: './complaints.html',
  providers: [MessageService],
  styleUrls: ['./complaints.css']
})
export class Complaints implements OnInit {
  messageService = inject(MessageService)
  contato: any [] = [];
  loading = true; 

  constructor( private cdr: ChangeDetectorRef, private http: HttpClient) { }

  async ngOnInit() {
    await this.loadContato()
  }

  async loadContato() {
    try {
      const data = await firstValueFrom(
        this.http.get<any[]>(`${environment.apiUrl}/contato`)
      );
      this.contato = data ?? [];
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      this.contato = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  } 
}
