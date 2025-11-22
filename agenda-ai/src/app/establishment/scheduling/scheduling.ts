import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ServiceSchedulingService } from '../../services/serviceScheduling/serviceScheduling.service';
import { CommonModule, formatDate } from '@angular/common';
import { Footer } from '../../shared/footer/footer';
import { HttpClientModule } from '@angular/common/http';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-scheduling',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Footer, RouterLink, HttpClientModule, DatePickerModule],
  templateUrl: './scheduling.html',
  styleUrl: './scheduling.css'
})
export class Scheduling implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private schedulingService = inject(ServiceSchedulingService);

  schedulingForm!: FormGroup;
  serviceId!: string;
  userId!: string;

  availableTimes: string[] = [];
  
  minDate: Date = new Date();
  disabledDates: Date[] = [];
  
  private currentMonth: number = new Date().getMonth();
  private currentYear: number = new Date().getFullYear();

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('idService') as string;
    this.userId = this.route.snapshot.paramMap.get('idUser') as string;

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

  onMonthChange(event: { month: number | undefined, year: number }) {
    if (event.month !== undefined) {
      this.getAvailableDatesForMonth(event.year, event.month - 1);
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

    const payload = {
      services_entrepreneur_id: this.serviceId,
      user_id: this.userId,
      name: formValue.customer_name,
      age: formValue.customer_age,
      description: formValue.description,
      date: dateStr,
      time: formValue.time
    };

    this.schedulingService.createScheduling(payload).subscribe({
      next: () => {
        alert("Agendamento realizado com sucesso!");
      },
      error: (err: any) => {
        const errorMessage = err.error?.error || "Erro desconhecido ao agendar!";
        alert(`Erro: ${errorMessage}`);
      }
    });
  }
}
