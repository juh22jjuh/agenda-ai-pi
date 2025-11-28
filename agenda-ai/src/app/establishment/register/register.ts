import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';

// Componentes compartilhados
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';

// Serviços
import { EstablishmentService } from '../establishment.service';
import { ViacepService, ViaCEPResponse } from '../viacep.service';

// Módulos PrimeNG
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    // Componentes
    Navbar,
    Footer,
    // Módulos PrimeNG
    ToastModule,
    CardModule,
    FileUploadModule,
    InputTextModule,
    InputMaskModule,
    ButtonModule,
    ProgressSpinnerModule,
    CheckboxModule
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  providers: [MessageService] // Fornecer o MessageService
})
export class EstablishmentRegisterComponent implements OnInit {

  registerForm: FormGroup; // Corrigido para registerForm
  states: any[] = [];
  selectedImage: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  isSubmitting = false;
  isCepLoading = false;

  constructor(
    private fb: FormBuilder,
    private viacepService: ViacepService,
    private establishmentService: EstablishmentService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      cpf: ['', [Validators.required]],
      telefone: ['', Validators.required],
      cep: ['', Validators.required],
      rua: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', Validators.required],
      termos: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.loadStates();
  }

  loadStates(): void {
    this.states = [
      { label: 'Acre', value: 'AC' }, { label: 'Alagoas', value: 'AL' }, { label: 'Amapá', value: 'AP' },
      { label: 'Amazonas', value: 'AM' }, { label: 'Bahia', value: 'BA' }, { label: 'Ceará', value: 'CE' },
      { label: 'Distrito Federal', value: 'DF' }, { label: 'Espírito Santo', value: 'ES' }, { label: 'Goiás', value: 'GO' },
      { label: 'Maranhão', value: 'MA' }, { label: 'Mato Grosso', value: 'MT' }, { label: 'Mato Grosso do Sul', value: 'MS' },
      { label: 'Minas Gerais', value: 'MG' }, { label: 'Pará', value: 'PA' }, { label: 'Paraíba', value: 'PB' },
      { label: 'Paraná', value: 'PR' }, { label: 'Pernambuco', value: 'PE' }, { label: 'Piauí', value: 'PI' },
      { label: 'Rio de Janeiro', value: 'RJ' }, { label: 'Rio Grande do Norte', value: 'RN' }, { label: 'Rio Grande do Sul', value: 'RS' },
      { label: 'Rondônia', value: 'RO' }, { label: 'Roraima', value: 'RR' }, { label: 'Santa Catarina', value: 'SC' },
      { label: 'São Paulo', value: 'SP' }, { label: 'Sergipe', value: 'SE' }, { label: 'Tocantins', value: 'TO' }
    ];
  }

  onFileSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  clearFile(): void {
    this.selectedImage = null;
    this.imagePreview = null;
    this.registerForm.get('companyImage')?.setValue(null);
  }

  onCepBlur(): void {
    const cep = this.registerForm.get('cep')?.value;
    if (cep && cep.length >= 8) {
      this.isCepLoading = true;
      this.viacepService.search(cep.replace(/\D/g, '')).subscribe((data: ViaCEPResponse | null) => {
        this.isCepLoading = false;
        if (data && !data.erro) {
          this.registerForm.patchValue({
            rua: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf
          });
        } else {
          this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'CEP não encontrado.' });
        }
      });
    }
  }
  
  resetForm(): void {
      this.registerForm.reset();
      this.clearFile();
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    this.isSubmitting = true;

    const userString = localStorage.getItem('user_logged');
    if (!userString) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Sessão do usuário não encontrada. Faça o login novamente.' });
      this.isSubmitting = false;
      return;
    }

    let user, userId;
    try {
      user = JSON.parse(userString);
      userId = user?._id;
      if (!userId) throw new Error("ID do usuário inválido no objeto de usuário.");
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Dados de usuário corrompidos. Faça o login novamente.' });
      this.isSubmitting = false;
      return;
    }

    const formData = new FormData();
    Object.keys(this.registerForm.value).forEach(key => {
      if (key !== 'companyImage') {
        formData.append(key, this.registerForm.value[key]);
      }
    });
    
    formData.append('user', userId);


    this.establishmentService.registerEntrepreneur(userId, formData).subscribe({
      next: (response) => {
        const entrepreneur = response.entrepreneur || response;
        if (entrepreneur && entrepreneur._id) {
          user.entrepreneurId = entrepreneur._id;
          localStorage.setItem('user_logged', JSON.stringify(user));
        }

        this.messageService.add({ severity: 'success', summary: 'Sucesso!', detail: 'Empresa registrada com sucesso! Redirecionando...' });
        setTimeout(() => this.router.navigate(['/establishment/profile']), 2000);
      },
      error: (err) => {
        const errorMessage = err.error?.message || err.message || 'Não foi possível registrar a empresa.';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: errorMessage });
        this.isSubmitting = false;
      }
    });
  }
}
