import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ServiceSchedulingService } from '../../services/serviceScheduling/serviceScheduling.service';
import { CommonModule } from '@angular/common';
import { Footer } from '../../shared/footer/footer';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-scheduling',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Footer, RouterLink, RouterLinkActive],
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

ngOnInit(): void {
  this.serviceId = this.route.snapshot.paramMap.get('id') as string;

  this.schedulingForm = this.fb.group({
    customer_name: ['', Validators.required],
    customer_age: ['', Validators.required],
    description: [''],
    date: ['', Validators.required],
    time: ['', Validators.required],
  });

  // só inicia o listener após tudo estar carregado
  setTimeout(() => {
    this.onDateChanges();
  }, 0);
}


onDateChanges() {
  this.schedulingForm.get('date')?.valueChanges.subscribe(date => {
    console.log("📅 Data selecionada:", date);
    console.log("🆔 ServiceId atual:", this.serviceId);

    if (!date || !this.serviceId) {
      console.log("❌ Data ou serviceId ausentes");
      return;
    }

    this.schedulingService
      .getAvailableTimes(this.serviceId, date)
      .subscribe((res: any) => {
        console.log("✔️ Resposta do backend:", res);
        this.availableTimes = res.availableTimes;
      });
  });
}

submit() {
  if (this.schedulingForm.invalid) return;

  const formValue = this.schedulingForm.value;

  // 🟢 CORREÇÃO: Mapear os nomes dos campos
  const payload = {
    // Backend espera services_entrepreneur_id, não service_id
    services_entrepreneur_id: this.serviceId, 
    user_id: "ID_DO_USUARIO_LOGADO", 
    
    // Backend espera 'name' e 'age', não 'customer_name' e 'customer_age'
    name: formValue.customer_name,     
    age: formValue.customer_age,       
    
    description: formValue.description,
    date: formValue.date,
    time: formValue.time
  };

  this.schedulingService.createScheduling(payload).subscribe({
    next: () => {
        alert("Agendamento realizado com sucesso!");
        // Opcional: Redirecionar ou resetar formulário
    },
    error: (err) => {
      // Usa a mensagem de erro que o backend envia (ex: "Este horário já está ocupado")
      const errorMessage = err.error?.error || "Erro desconhecido ao agendar!";
      alert(`Erro: ${errorMessage}`);
    }
  });

    this.schedulingService.createScheduling(payload).subscribe(
      () => alert("Agendamento realizado com sucesso!"),
      () => alert("Erro ao realizar agendamento!")
    );
  }
}
