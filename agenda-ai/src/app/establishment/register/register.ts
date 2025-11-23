
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';

// Services
import { ViacepService, ViaCEPResponse } from '../viacep.service';
import { EstablishmentService } from '../establishment.service';

// PrimeNG Modules
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule, FileSelectEvent } from 'primeng/fileupload';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Shared Components
import { NavbarAuth } from '../../shared/navbar-auth/navbar-auth';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-register-establishment',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ToastModule, CardModule, InputTextModule,
    InputMaskModule, CheckboxModule, ButtonModule, FileUploadModule, ProgressSpinnerModule,
    NavbarAuth, Footer
  ],
  providers: [MessageService], // Provide MessageService locally
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterEstablishmentComponent implements OnInit {
  // Service Injections
  private fb = inject(FormBuilder);
  private viacepService = inject(ViacepService);
  private establishmentService = inject(EstablishmentService);
  private messageService = inject(MessageService);

  // Properties
  registerForm!: FormGroup;
  states: { name: string, value: string }[] = [];
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  
  // UI State Flags
  isCepLoading = false;
  isSubmitting = false;

  ngOnInit(): void {
    this.buildForm();
    this.loadStates();
  }

  private buildForm(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      telefone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\) \d{5}-\d{4}$/)]],
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
      rua: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', Validators.required],
      termos: [false, Validators.requiredTrue]
    });
  }

  onCepBlur(): void {
    const cepControl = this.registerForm.get('cep');
    if (cepControl && cepControl.valid) {
      const cep = cepControl.value.replace(/\D/g, ''); // Remove non-digit characters
      this.isCepLoading = true;
      
      this.viacepService.search(cep).subscribe(data => {
        this.isCepLoading = false;
        if (data && !data.erro) {
          this.patchAddressData(data);
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Endereço encontrado!' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'CEP não encontrado ou inválido.' });
        }
      });
    }
  }

  private patchAddressData(data: ViaCEPResponse): void {
    this.registerForm.patchValue({
      rua: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf
    });
  }

  onFileSelect(event: FileSelectEvent): void {
    const file = event.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Generate a preview
      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  clearFile(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched(); // Trigger validation messages
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    this.isSubmitting = true;
    const formData = this.buildFormData();

    this.establishmentService.register(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.messageService.add({ severity: 'success', summary: 'Sucesso!', detail: 'Estabelecimento cadastrado com sucesso!' });
        this.resetForm();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.messageService.add({ severity: 'error', summary: 'Erro no Cadastro', detail: err.message });
      }
    });
  }

  private buildFormData(): FormData {
    const formData = new FormData();
    Object.keys(this.registerForm.controls).forEach(key => {
      // Clean masked values before sending
      let value = this.registerForm.get(key)?.value;
      if (['cpf', 'telefone', 'cep'].includes(key)) {
        value = String(value).replace(/\D/g, '');
      }
      formData.append(key, value);
    });

    if (this.selectedFile) {
      formData.append('companyImage', this.selectedFile, this.selectedFile.name);
    }
    return formData;
  }

  resetForm(): void {
    this.registerForm.reset();
    this.clearFile();
    this.registerForm.get('termos')?.setValue(false); // Reset checkbox state
  }

  private loadStates(): void { /* ... O seu array de estados ... */ }
}
