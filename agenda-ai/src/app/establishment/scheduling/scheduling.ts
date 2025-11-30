import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ServiceSchedulingService } from '../../services/serviceScheduling/serviceScheduling.service';
import { CommonModule, formatDate } from '@angular/common';
import { Footer } from '../../shared/footer/footer';
import { DatePickerModule } from 'primeng/datepicker';
import { FileUploadModule } from 'primeng/fileupload';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { NavbarAuth } from '../../shared/navbar-auth/navbar-auth';

@Component({
  selector: 'app-scheduling',
  standalone: true,
  // Imports necessários para funcionamento da tela
  imports: [CommonModule, ReactiveFormsModule, ToastModule, Footer, RouterLink, DatePickerModule, FileUploadModule, FormsModule, NavbarAuth],
  templateUrl: './scheduling.html',
  styleUrl: './scheduling.css'
})
export class Scheduling implements OnInit {

  // Injeções do Angular utilizadas para formulários, rotas e serviços
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private schedulingService = inject(ServiceSchedulingService);
  
  constructor(private messageService: MessageService, private router: Router) {}

  // Formulário de agendamento
  schedulingForm!: FormGroup;

  // IDs recebidos pela rota (serviço, usuário e empreendedor)
  serviceId!: string;
  userId!: string;
  entrepreneuerId!: string;

  // Lista de horários disponíveis retornados pelo backend
  availableTimes: string[] = [];
  
  // Configurações do calendário
  minDate: Date = new Date(); // Data mínima para seleção
  disabledDates: Date[] = []; // Datas não disponíveis
  uploadedFiles: any[] = [];  // Arquivo de referência enviado pelo cliente
  
  // Controle de mês e ano atuais para carregar disponibilidade
  private currentMonth: number = new Date().getMonth();
  private currentYear: number = new Date().getFullYear();

  ngOnInit(): void {
    // Pegando IDs da rota
    this.serviceId = this.route.snapshot.paramMap.get('idService') as string;
    this.userId = this.route.snapshot.paramMap.get('idUser') as string;
    this.entrepreneuerId = this.route.snapshot.paramMap.get('idEntrepreneur') as string;

    // Criando formulário com validações
    this.schedulingForm = this.fb.group({
      customer_name: ['', Validators.required],
      customer_age: ['', Validators.required],
      description: [''],
      date: [null as Date | null, Validators.required],
      time: ['', Validators.required],
    });

    // Carrega datas disponíveis do mês atual
    this.getAvailableDatesForMonth(this.currentYear, this.currentMonth);

    // Escuta mudanças na data para buscar horários disponíveis
    this.onDateChanges();
  }

  // Captura arquivos enviados pelo usuário
  onFileSelect(event: any) {
    this.uploadedFiles = event.files;
  }

  // Evento disparado quando o mês do calendário muda
  onMonthChange(event: any) {
    if (event.month !== undefined && event.month !== null && event.year !== undefined && event.year !== null) {
      const month = event.month;
      const year = event.year;
      // Atualiza datas disponíveis ao trocar o mês
      this.getAvailableDatesForMonth(year, month - 1);
    }
  }

  // Busca no backend os dias disponíveis do mês selecionado
  private getAvailableDatesForMonth(year: number, month: number) {
    this.currentYear = year;
    this.currentMonth = month;
    
    this.schedulingService.getAvailableDates(this.serviceId, month + 1, year).subscribe((res: any) => {
      const availableDatesStr: string[] = res.availableDates || [];
      this.generateDisabledDates(availableDatesStr);
    });
  }

  // Gera lista de datas bloqueadas para o calendário
  private generateDisabledDates(availableDatesStr: string[]) {
    this.disabledDates = [];
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(this.currentYear, this.currentMonth, i);
      const currentDateStr = formatDate(currentDate, 'yyyy-MM-dd', 'en-US');
      
      // Datas que não estiverem disponíveis são desabilitadas
      if (!availableDatesStr.includes(currentDateStr)) {
        this.disabledDates.push(currentDate);
      }
    }
  }

  // Observa quando o usuário muda a data e atualiza horários disponíveis
  private onDateChanges() {
    this.schedulingForm.get('date')?.valueChanges.subscribe((selectedDate: Date | null) => {
      this.availableTimes = [];
      this.schedulingForm.get('time')?.reset();

      if (!selectedDate || !this.serviceId) {
        return;
      }
      
      const dateStr = formatDate(selectedDate, 'yyyy-MM-dd', 'en-US');

      // Busca horários disponíveis para a data informada
      this.schedulingService.getAvailableTimes(this.serviceId, dateStr).subscribe((res: any) => {
        this.availableTimes = res.availableTimes;
      });
    });
  }

  // Envia o formulário ao backend para criar um agendamento
  submit() {
    if (this.schedulingForm.invalid) return;

    const formValue = this.schedulingForm.value;
    
    const dateStr = formatDate(formValue.date, 'yyyy-MM-dd', 'en-US');

    // FormData para enviar possíveis arquivos junto ao agendamento
    const formData = new FormData();
    formData.append('services_entrepreneur_id', this.serviceId);
    formData.append('user_id', this.userId);
    formData.append('name', formValue.customer_name);
    formData.append('age', formValue.customer_age);
    formData.append('description', formValue.description);
    formData.append('date', dateStr);
    formData.append('time', formValue.time);

    // Se o usuário enviou uma imagem de referência, anexa ao formulário
    if (this.uploadedFiles.length > 0) {
      formData.append('inspirationImage', this.uploadedFiles[0]);
    }

    // Chama serviço para criar o agendamento
    this.schedulingService.createScheduling(formData).subscribe({
      next: () => {
        // Exibe mensagem de sucesso
        this.messageService.add({ severity: 'success', summary: 'Agendamento', detail: 'Agendamento realizado com sucesso.' });

        // Redireciona para tela de pré-agendamentos após 2 segundos
        setTimeout(() => this.router.navigate(['/establishment/pre-scheduling/', this.entrepreneuerId]), 1000);
      },
      error: (err: any) => {
        const errorMessage = err.error?.error || "Erro desconhecido ao agendar!";
        alert(`Erro: ${errorMessage}`);
      } 
    });
  }
}
