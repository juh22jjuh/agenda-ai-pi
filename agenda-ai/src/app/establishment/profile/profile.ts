
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EstablishmentService } from '../establishment.service';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { ServicesEntreprenuerService } from '../../services/servicesEntreprenuer/servicesEntreprenuer.service';
import { ConfirmationService, MessageService } from 'primeng/api';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

// App Components
import { NavbarEsta } from '../../shared/navbar-esta/navbar-esta';
import { Footer } from '../../shared/footer/footer';
import { ServiceSchedulingService } from '../../services/serviceScheduling/serviceScheduling.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    TableModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectButtonModule,
    CheckboxModule,
    ToastModule,
    ConfirmDialogModule,
    NavbarEsta,
    Footer,
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  providers: [ConfirmationService, MessageService] // Important for dialogs and toasts
})
export class Profile implements OnInit {

  // Data properties
  entrepreneur: any = null;
  services: any[] = [];
  schedules: any[] = [];

  // State properties
  loading = true;
  errorMessage: string | null = null;
  displayServiceDialog = false;
  editingService: any = null;

  // Form properties
  serviceForm!: FormGroup;
  categories: string[];
  daysOfWeek: any[];
  timeOptions: any[];

  constructor(
    private establishmentService: EstablishmentService,
    private serviceEntreprenuer: ServicesEntreprenuerService,
    private serviceScheduling: ServiceSchedulingService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.daysOfWeek = [
      { id: "monday", label: "Segunda" }, { id: "tuesday", label: "Terça" },
      { id: "wednesday", label: "Quarta" }, { id: "thursday", label: "Quinta" },
      { id: "friday", label: "Sexta" }, { id: "saturday", label: "Sábado" },
      { id: "sunday", label: "Domingo" }
    ];
    this.timeOptions = Array.from({ length: 17 }, (_, i) => ({ id: `${i + 6}:00`, label: `${i + 6}:00` }));
    this.categories = ["Corte", "Coloração", "Tratamento", "Manicure", "Pedicure", "Depilação", "Limpeza de Pele", "Massagem", "Maquiagem", "Sobrancelhas"];
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
  }

  initializeForm(): void {
    this.serviceForm = this.fb.group({
      nome: ['', Validators.required],
      categoria: ['', Validators.required],
      descricao: ['', Validators.required],
      duracao: [30, [Validators.required, Validators.min(1)]],
      dias: [[]],
      time: [[]]
    });
  }

  loadInitialData(): void {
    const userString = localStorage.getItem('user_logged');
    if (!userString) {
      this.handleAuthError("Usuário não autenticado.");
      return;
    }

    try {
      const userId = JSON.parse(userString)?._id;
      if (!userId) {
        this.handleAuthError("ID do usuário não encontrado.");
        return;
      }

      this.loading = true;
      this.establishmentService.getEntrepreneurData(userId).pipe(
        tap(data => {
          this.entrepreneur = data;
          if (!data?._id) throw new Error("ID do empreendedor não encontrado.");
        }),
        switchMap(data => this.fetchAllData(data._id)),
        catchError(err => this.handleDataError(err))
      ).subscribe(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
    } catch (error) {
      this.handleAuthError("Erro ao processar dados do usuário.");
    }
  }

  fetchAllData(entrepreneurId: string) {
    return forkJoin({
      services: this.establishmentService.getServices(entrepreneurId),
      schedules: this.establishmentService.getSchedules(entrepreneurId)
    }).pipe(
      tap(({ services, schedules }) => {
        this.services = services;
        this.schedules = schedules;
      })
    );
  }

  // Service CRUD Methods
  openNewServiceDialog(): void {
    this.editingService = null;
    this.serviceForm.reset({ duracao: 30 });
    this.displayServiceDialog = true;
  }

  openEditServiceDialog(service: any): void {
    this.editingService = service;
    const serviceData = {
        ...service,
        dias: service.dias.map((d: any) => d.id),
        time: service.time.map((t: any) => t.id),
    };
    this.serviceForm.patchValue(serviceData);
    this.displayServiceDialog = true;
  }
  
  hideServiceDialog(): void {
      this.displayServiceDialog = false;
      this.editingService = null;
  }

  saveService(): void {
    if (!this.serviceForm.valid) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Por favor, preencha todos os campos obrigatórios.' });
      return;
    }

    const formValue = this.serviceForm.value;

    const formData = {
      ...formValue,
      dias: formValue.dias.map((id: string) => {
        const day = this.daysOfWeek.find(d => d.id === id);
        return day ? { id: day.id, label: day.label } : null;
      }).filter(Boolean),
      time: formValue.time.map((id: string) => {
        const timeOption = this.timeOptions.find(t => t.id === id);
        return timeOption ? { id: timeOption.id, label: timeOption.label } : null;
      }).filter(Boolean)
    };

    const operation$ = this.editingService
      ? this.serviceEntreprenuer.updateService(this.editingService._id, formData)
      : this.serviceEntreprenuer.register(this.entrepreneur._id, formData);

    const summary = this.editingService ? 'Serviço Atualizado' : 'Serviço Criado';

    operation$.pipe(catchError(err => this.handleDataError(err))).subscribe(() => {
      this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `${summary} com sucesso!` });
      this.hideServiceDialog();
      // Refresh data
      this.fetchAllData(this.entrepreneur._id).subscribe();
    });
  }

  deleteService(service: any): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o serviço "${service.nome}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.serviceEntreprenuer.deleteService(service._id).pipe(catchError(err => this.handleDataError(err))).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Serviço excluído!' });
          this.fetchAllData(this.entrepreneur._id).subscribe();
        });
      }
    });
  }

  // Schedule and Company Methods
  cancelSchedule(schedule: any): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja cancelar o agendamento do cliente ${schedule.user_id?.name}?`,
      header: 'Confirmar Cancelamento',
      icon: 'pi pi-calendar-times',
      accept: () => {
        // Assuming a method exists in the service to cancel
        this.serviceScheduling.cancelScheduling(schedule._id).pipe(catchError(err => this.handleDataError(err))).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Agendamento cancelado.' });
          this.fetchAllData(this.entrepreneur._id).subscribe();
        });
      }
    });
  }
  
  deleteCompany(): void {
    this.confirmationService.confirm({
        message: 'Atenção! Esta ação é irreversível e excluirá sua empresa, todos os serviços e agendamentos. Deseja continuar?',
        header: 'Excluir Empresa',
        icon: 'pi pi-exclamation-triangle',
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => {
            // Assuming a method exists in the service
            this.establishmentService.deleteService(this.entrepreneur._id).pipe(catchError(err => this.handleDataError(err))).subscribe(() => {
                this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Empresa excluída.' });
                localStorage.removeItem('user_logged');
                this.router.navigate(['/auth/login']);
            });
        }
    });
}

  // Error Handling
  private handleDataError(err: any) {
    const defaultMessage = 'Ocorreu um erro. Tente novamente.';
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: err?.error?.message || defaultMessage });
    this.loading = false;
    this.cdr.detectChanges();
    return of(null);
  }

  private handleAuthError(message: string): void {
    this.errorMessage = message;
    this.loading = false;
    this.messageService.add({ severity: 'error', summary: 'Erro de Autenticação', detail: message });
    this.router.navigate(['/auth/login']);
    this.cdr.detectChanges();
  }
}
