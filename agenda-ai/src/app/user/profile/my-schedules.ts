import { Component, OnInit } from '@angular/core';
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
    <div class="my-schedules-container">
      <h2>Meus Agendamentos</h2>
      <div *ngIf="schedulings.length > 0; else noSchedulings">
        <div *ngFor="let scheduling of schedulings" class="schedule-card">
          <p-card>
            <ng-template pTemplate="title">{{ scheduling.services_entrepreneur_id.name }}</ng-template>
            <ng-template pTemplate="subtitle">{{ scheduling.date }} - {{ scheduling.time }}</ng-template>
            <div class="p-card-content">
              <p>Status: <p-tag [value]="scheduling.status" [severity]="getSeverity(scheduling.status)"></p-tag></p>
              <p>Descrição: {{ scheduling.description }}</p>
            </div>
            <div class="p-card-footer">
              <p-button label="Cancelar" icon="pi pi-times" styleClass="p-button-danger" (click)="cancelScheduling(scheduling._id)" [disabled]="scheduling.status === 'Cancelado'"></p-button>
            </div>
          </p-card>
        </div>
      </div>
      <ng-template #noSchedulings>
        <p>Você não possui nenhum agendamento.</p>
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
    private schedulingService: ServiceSchedulingService
  ) {}

  ngOnInit(): void {
    const { user } = this.authService.getUserData();
    this.user = user;
    this.loadSchedulings();
  }

  loadSchedulings() {
    if (this.user && this.user._id) {
      this.schedulingService.getSchedulingByUser(this.user._id).subscribe(
        (res: any) => {
          this.schedulings = res;
        },
        (err) => {
          console.error(err);
        }
      );
    }
  }

  cancelScheduling(schedulingId: string) {
    this.schedulingService.cancelScheduling(schedulingId).subscribe(
      () => {
        this.loadSchedulings();
      },
      (err) => {
        console.error(err);
      }
    );
  }

  getSeverity(status: string): string {
    switch (status) {
      case 'Confirmado':
        return 'success';
      case 'Pendente':
        return 'warning';
      case 'Cancelado':
        return 'danger';
      default:
        return 'info';
    }
  }
}
