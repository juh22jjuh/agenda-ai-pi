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

@Component({
  selector: 'app-scheduling',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule, Footer, RouterLink, DatePickerModule, FileUploadModule, FormsModule],
  templateUrl: './scheduling.html',
  styleUrl: './scheduling.css'
})
export class Scheduling implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private schedulingService = inject(ServiceSchedulingService);
  
  constructor(private messageService: MessageService, private router: Router) {}

  schedulingForm!: FormGroup;
  serviceId!: string;
  userId!: string;
  entrepreneuerId!: string;
  availableTimes: string[] = [];
  
  minDate: Date = new Date();
  disabledDates: Date[] = [];
  uploadedFiles: any[] = [];
  
  private currentMonth: number = new Date().getMonth();
  private currentYear: number = new Date().getFullYear();

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('idService') as string;
    this.userId = this.route.snapshot.paramMap.get('idUser') as string;
    this.entrepreneuerId = this.route.snapshot.paramMap.get('idEntrepreneur') as string


    this.schedulingForm = this.fb.group({

      customer_name: ['', Validators.required],
      customer_age: ['', Validators.required],
      description: [''],
      date: [null as Date | null, Validators.required],
      time: ['', Validators.required],
    });

    this.getAvailableDatesForMonth(this.currentYear, this.currentMonth);
    this.onDateChanges();
  }

  onFileSelect(event: any) {
    this.uploadedFiles = event.files;
  }

  onMonthChange(event: any) {
    if (event.month !== undefined && event.month !== null && event.year !== undefined && event.year !== null) {
      const month = event.month;
      const year = event.year;
      this.getAvailableDatesForMonth(year, month - 1);
    }
  }

  private getAvailableDatesForMonth(year: number, month: number) {
    this.currentYear = year;
    this.currentMonth = month;
    
    this.schedulingService.getAvailableDates(this.serviceId, month + 1, year).subscribe((res: any) => {
      const availableDatesStr: string[] = res.availableDates || [];
      this.generateDisabledDates(availableDatesStr);
    });
  }

  private generateDisabledDates(availableDatesStr: string[]) {
    this.disabledDates = [];
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(this.currentYear, this.currentMonth, i);
      const currentDateStr = formatDate(currentDate, 'yyyy-MM-dd', 'en-US');
      
      if (!availableDatesStr.includes(currentDateStr)) {
        this.disabledDates.push(currentDate);
      }
    }
  }

  private onDateChanges() {
    this.schedulingForm.get('date')?.valueChanges.subscribe((selectedDate: Date | null) => {
      this.availableTimes = [];
      this.schedulingForm.get('time')?.reset();

      if (!selectedDate || !this.serviceId) {
        return;
      }
      
      const dateStr = formatDate(selectedDate, 'yyyy-MM-dd', 'en-US');
      this.schedulingService.getAvailableTimes(this.serviceId, dateStr).subscribe((res: any) => {
        this.availableTimes = res.availableTimes;
      });
    });
  }

  submit() {
    if (this.schedulingForm.invalid) return;

    const formValue = this.schedulingForm.value;
    
    const dateStr = formatDate(formValue.date, 'yyyy-MM-dd', 'en-US');

    const formData = new FormData();
    formData.append('services_entrepreneur_id', this.serviceId);
    formData.append('user_id', this.userId);
    formData.append('name', formValue.customer_name);
    formData.append('age', formValue.customer_age);
    formData.append('description', formValue.description);
    formData.append('date', dateStr);
    formData.append('time', formValue.time);

    if (this.uploadedFiles.length > 0) {
      formData.append('inspirationImage', this.uploadedFiles[0]);
    }

    this.schedulingService.createScheduling(formData).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Agendamento', detail: 'Agendamento realizado com sucesso.' });
        setTimeout(() => this.router.navigate(['/establishment/pre-scheduling/', this.entrepreneuerId]), 2000);
      },
      error: (err: any) => {
        const errorMessage = err.error?.error || "Erro desconhecido ao agendar!";
        alert(`Erro: ${errorMessage}`);
      } 
    });
  }
}
