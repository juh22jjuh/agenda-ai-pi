
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EstablishmentService } from '../establishment.service';
import { forkJoin, throwError, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { ServicesEntreprenuerService } from '../../services/servicesEntreprenuer/servicesEntreprenuer.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';

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
import { FileUploadModule } from 'primeng/fileupload';
import { NavbarAuth } from '../../shared/navbar-auth/navbar-auth';

// App Components
import { Footer } from '../../shared/footer/footer';
import { ServiceSchedulingService } from '../../services/serviceScheduling/serviceScheduling.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, CardModule, ButtonModule, ProgressSpinnerModule, TableModule, DialogModule,
    InputTextModule, TextareaModule, SelectButtonModule, CheckboxModule, ToastModule, ConfirmDialogModule,
    FileUploadModule, Footer, NavbarAuth
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  providers: [ConfirmationService, MessageService]
})
export class Profile implements OnInit {

  entrepreneur: any = null;
  services: any[] = [];
  schedules: any[] = [];
  loading = true;
  errorMessage: string | null = null;
  displayServiceDialog = false;
  displayEditProfileDialog = false;
  editingService: any = null;
  selectedProfileImage: File | null = null;
  serviceForm!: FormGroup;
  editProfileForm!: FormGroup;
  categories: string[];
  daysOfWeek: any[];
  timeOptions: any[];

  constructor(
    private establishmentService: EstablishmentService, private serviceEntreprenuer: ServicesEntreprenuerService,
    private serviceScheduling: ServiceSchedulingService, private router: Router, private cdr: ChangeDetectorRef,
    private fb: FormBuilder, private confirmationService: ConfirmationService, private messageService: MessageService
  ) {
    this.daysOfWeek = [{ id: "monday", label: "Segunda" }, { id: "tuesday", label: "Terça" }, { id: "wednesday", label: "Quarta" }, { id: "thursday", label: "Quinta" }, { id: "friday", label: "Sexta" }, { id: "saturday", label: "Sábado" }, { id: "sunday", label: "Domingo" }];
    this.timeOptions = Array.from({ length: 17 }, (_, i) => ({ id: `${i + 6}:00`, label: `${i + 6}:00` }));
    this.categories = ["Cabelo", "Manicure", "Pedicure", "Esteticista", "Maquiagem", "Sobrancelhas", "Barbeiro", "Tatuador",];
  }

  ngOnInit(): void {
    this.initializeServiceForm();
    this.initializeEditProfileForm();
    this.loadInitialData();
  }

  initializeServiceForm(): void {
    this.serviceForm = this.fb.group({
      nome: ['', Validators.required],
      categoria: ['', Validators.required],
      descricao: ['', Validators.required],
      duracao: [30, [Validators.required, Validators.min(1)]],
      dias: [[]],
      time: [[]]
    });
  }

  initializeEditProfileForm(): void {
    this.editProfileForm = this.fb.group({
      name: ['', Validators.required], telefone: ['', Validators.required], cep: ['', Validators.required],
      rua: ['', Validators.required], numero: ['', Validators.required], comple: [''],
      bairro: ['', Validators.required], cidade: ['', Validators.required], estado: ['', Validators.required]
    });
  }

  loadInitialData(): void {
    const userString = localStorage.getItem('user_logged');
    if (!userString) { this.handleAuthError("Usuário não autenticado."); return; }
    try {
      const userId = JSON.parse(userString)?._id;
      if (!userId) { this.handleAuthError("ID do usuário não encontrado."); return; }

      this.loading = true;
      this.establishmentService.getEntrepreneurByUserId(userId).pipe(
        tap(data => {
          this.entrepreneur = data;
          console.log(this.entrepreneur)
          console.log('id empresa', data?._id)
          if (!data?._id) throw new Error("ID do empreendedor não encontrado.");
        }),
        switchMap(data => this.fetchAllData(data._id)),
        catchError((err: HttpErrorResponse) => {
          if (err.status === 404) {
            this.router.navigate(['/establishment/register']);
            return of(undefined);
          }
          return this.handleDataError(err);
        })
      ).subscribe({
        next: (result) => {
          if (result) {
            this.loading = false;
            this.cdr.detectChanges();
          }
        },
        error: () => { this.loading = false; this.cdr.detectChanges(); }
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
      tap(({ services, schedules }) => { this.services = services; this.schedules = schedules; }),
      catchError(err => this.handleDataError(err))
    );
  }

  openEditProfileDialog(): void {
    this.editProfileForm.patchValue(this.entrepreneur);
    this.selectedProfileImage = null;
    this.displayEditProfileDialog = true;
  }

  hideEditProfileDialog(): void {
    this.displayEditProfileDialog = false;
  }

  saveProfile(): void {
  if (!this.editProfileForm.valid) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Por favor, preencha todos os campos obrigatórios.'
    });
    return;
  }

  const payload = this.editProfileForm.value; // agora é JSON puro

  this.establishmentService
    .updateEntrepreneur(this.entrepreneur._id, payload)
    .pipe(
      catchError((err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível atualizar o perfil.'
        });
        return of(null);
      })
    )
    .subscribe({
      next: (response: any) => {
        if (response && response.entrepreneur) {
          this.entrepreneur = response.entrepreneur;

          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Perfil atualizado com sucesso!'
          });

          this.hideEditProfileDialog();
          this.cdr.detectChanges();
        }
      }
    });
}

  openNewServiceDialog(): void {
    this.editingService = null;
    this.serviceForm.reset({ duracao: 30 });
    this.displayServiceDialog = true;
  }

  openEditServiceDialog(service: any): void {
    this.editingService = service;
    const serviceData = { ...service, dias: service.dias.map((d: any) => d.id), time: service.time.map((t: any) => t.id) };
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
    const serviceData = {
      ...formValue,
      dias: formValue.dias.map((id: string) => this.daysOfWeek.find(d => d.id === id)).filter(Boolean),
      time: formValue.time.map((id: string) => this.timeOptions.find(t => t.id === id)).filter(Boolean)
    };

    const operation$ = this.editingService
      ? this.serviceEntreprenuer.updateService(this.editingService._id, serviceData)
      : this.serviceEntreprenuer.register(this.entrepreneur._id, serviceData);
    const summary = this.editingService ? 'Serviço Atualizado' : 'Serviço Criado';

    operation$.pipe(catchError(err => this.handleDataError(err))).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `${summary} com sucesso!` });
        this.hideServiceDialog();
        this.fetchAllData(this.entrepreneur._id).subscribe({ error: () => { } });
      },
      error: () => { }
    });
  }

  deleteService(service: any): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o serviço "${service.nome}"?`, header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.serviceEntreprenuer.deleteService(service._id).pipe(catchError(err => this.handleDataError(err))).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Serviço excluído!' });
            this.fetchAllData(this.entrepreneur._id).subscribe({ error: () => { } });
          },
          error: () => { }
        });
      }
    });
  }

  cancelSchedule(schedule: any): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja cancelar o agendamento do cliente ${schedule.user_id?.name}?`, header: 'Confirmar Cancelamento',
      icon: 'pi pi-calendar-times',
      accept: () => {
        this.serviceScheduling.cancelScheduling(schedule._id).pipe(catchError(err => this.handleDataError(err))).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Agendamento cancelado.' });
            this.fetchAllData(this.entrepreneur._id).subscribe({ error: () => { } });
          },
          error: () => { }
        });
      }
    });
  }

  deleteCompany(): void {
    this.confirmationService.confirm({
      message: 'Atenção! Esta ação é irreversível e excluirá sua empresa. Deseja continuar?', header: 'Excluir Empresa',
      icon: 'pi pi-exclamation-triangle', acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.establishmentService.deleteEntrepreneur(this.entrepreneur._id).pipe(
          catchError(err => this.handleDataError(err))
        ).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Empresa excluída.' });
            window.location.reload()
          },
          error: () => {
            
           }
        });
      }
    });
  }

  private handleDataError(error: HttpErrorResponse) {
    const defaultMessage = 'Ocorreu um erro. Tente novamente.';
    const message = error.error?.message || defaultMessage;
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: message });
    this.loading = false;
    this.cdr.detectChanges();
    return throwError(() => error);
  }

  private handleAuthError(message: string): void {
    this.errorMessage = message;
    this.loading = false;
    this.messageService.add({ severity: 'error', summary: 'Erro de Autenticação', detail: message });
    this.router.navigate(['/auth/login']);
    this.cdr.detectChanges();
  }
}
