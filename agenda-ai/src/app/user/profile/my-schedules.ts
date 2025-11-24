import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../../auth/auth';
import { ServiceSchedulingService } from '../../services/serviceScheduling/serviceScheduling.service';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-my-schedules',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule],
  template: `
<div class="my-schedules-container"
     style="max-width:900px; margin:0 auto; padding:1rem;">

  <h2 style="
      font-size:2rem;
      margin-bottom:1rem;
      font-weight:700;
      color:#2f574f;
      text-align:center;
      letter-spacing:0.5px;">
    Meus Agendamentos
  </h2>

  <div *ngIf="schedulings.length > 0; else noSchedulings"
       style="display:flex; flex-direction:column; gap:1.2rem;">

    <div *ngFor="let scheduling of schedulings"
         class="schedule-card">

      <p-card
        [style]="{
          'border-radius':'16px',
          'border':'2px solid #a7c3b9',
          'box-shadow':'0 4px 12px rgba(0, 0, 0, 0.15)',
          'padding':'0.5rem'
        }"
      >
        <ng-template pTemplate="title">
          <span style="font-size:1.4rem; font-weight:600; color:#35564b;">
            {{ scheduling.services_entrepreneur_id?.nome || 'Serviço Indisponível' }}
          </span>
        </ng-template>

        <ng-template pTemplate="subtitle">
          <span style="font-size:1rem; color:#5a8075;">
            {{ scheduling.date }} — {{ scheduling.time }}
          </span>
        </ng-template>

        <ng-template pTemplate="content">
          <div style="color:#35564b; font-size:1.05rem; line-height:1.5;">
            <p style="margin-bottom:0.5rem;">
            
            </p>

            <p>
              <strong>Descrição:</strong>
              {{ scheduling.description }}
            </p>
          </div>
        </ng-template>

        <ng-template pTemplate="footer">
          <div style="display:flex; justify-content:flex-end;">
            <p-button
              label="Cancelar"
              icon="pi pi-times"
              styleClass="p-button-danger"
              [disabled]="scheduling.status === 'Cancelado'"
              (click)="cancelScheduling(scheduling._id)">
            </p-button>
          </div>
        </ng-template>

      </p-card>
    </div>
  </div>

  <ng-template #noSchedulings>
    <p style="text-align:center; color:#35564b; margin-top:1.5rem; font-size:1.2rem; opacity:0.8;">
      Você não possui nenhum agendamento.
    </p>
  </ng-template>
</div>
  `
})
export class MySchedules implements OnInit {
  schedulings: any[] = [];
  user: any;

  constructor(
    private http: HttpClient,
    private authService: Auth,
    private schedulingService: ServiceSchedulingService,
    private cdr: ChangeDetectorRef  // ✅ Injetado ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Pega o usuário imediatamente
    const userData = this.authService.getUserData();
    if (userData && userData.user) {
      this.user = userData.user;
      this.loadSchedulings();
    }
  }

  loadSchedulings() {
    if (this.user && this.user._id) {
      this.schedulingService.getSchedulingByUser(this.user._id).subscribe(
        (res: any[]) => {
          this.schedulings = res.filter(s => s.user_id === this.user._id);

          // ✅ Força atualização da view imediatamente
          this.cdr.detectChanges();
        },
        (err: any) => console.error('Erro ao carregar agendamentos:', err)
      );
    }
  }

  cancelScheduling(schedulingId: string) {
    this.schedulingService.cancelScheduling(schedulingId).subscribe(
      () => this.loadSchedulings(),
      (err: any) => console.error('Erro ao cancelar agendamento:', err)
    );
  }

  getSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status) {
      case 'Confirmado': return 'success';
      case 'Pendente': return 'warn';
      case 'Cancelado': return 'danger';
      default: return 'info';
    }
  }
}
