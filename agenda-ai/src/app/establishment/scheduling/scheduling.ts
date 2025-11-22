import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { ServiceSchedulingService } from '../../services/serviceScheduling/serviceScheduling.service';
import { CommonModule } from '@angular/common';
import { Footer } from '../../shared/footer/footer';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-scheduling',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Footer, RouterLink, RouterLinkActive, HttpClientModule],
  templateUrl: './scheduling.html',
  styleUrl: './scheduling.css'
})
export class Scheduling implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private schedulingService = inject(ServiceSchedulingService);

  schedulingForm!: FormGroup;
  serviceId!: string;

  availableTimes: string[] = [];
  availableDates: string[] = [];
  
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth() + 1;
  currentYear = this.currentDate.getFullYear();
  
  calendarDays: (number | null)[] = [];
  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('id') as string;

    this.schedulingForm = this.fb.group({
      customer_name: ['', Validators.required],
      customer_age: ['', Validators.required],
      description: [''],
      date: ['', Validators.required],
      time: ['', Validators.required],
    });

    this.getAvailableDates();

    setTimeout(() => {
      this.onDateChanges();
    }, 0);
  }

  onDateChanges() {
    this.schedulingForm.get('date')?.valueChanges.subscribe(date => {
      if (!date || !this.serviceId) {
        this.availableTimes = [];
        return;
      }
      this.schedulingService.getAvailableTimes(this.serviceId, date).subscribe((res: any) => {
        this.availableTimes = res.availableTimes;
      });
    });
  }

  getAvailableDates() {
    this.schedulingService.getAvailableDates(this.serviceId, this.currentMonth, this.currentYear).subscribe((res: any) => {
      this.availableDates = res.availableDates;
      this.generateCalendar();
    });
  }
  
  generateCalendar() {
    const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
    
    this.calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
      this.calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      this.calendarDays.push(i);
    }
  }
  
  isAvailable(day: number | null): boolean {
    if (!day) return false;
    const date = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return this.availableDates.includes(date);
  }

  isSelected(day: number | null): boolean {
    if (!day) return false;
    const date = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return this.schedulingForm.get('date')?.value === date;
  }
  
  selectDate(day: number | null) {
    if (this.isAvailable(day)) {
      const date = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      this.schedulingForm.get('date')?.setValue(date);
    }
  }

  previousMonth() {
    if (this.currentMonth === 1) {
      this.currentMonth = 12;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.getAvailableDates();
  }

  nextMonth() {
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.getAvailableDates();
  }

  submit() {
    if (this.schedulingForm.invalid) return;

    const formValue = this.schedulingForm.value;

    const payload = {
      services_entrepreneur_id: this.serviceId, 
      user_id: "ID_DO_USUARIO_LOGADO", // ATENÇÃO: Substituir pelo ID do usuário logado
      name: formValue.customer_name,     
      age: formValue.customer_age,       
      description: formValue.description,
      date: formValue.date,
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
