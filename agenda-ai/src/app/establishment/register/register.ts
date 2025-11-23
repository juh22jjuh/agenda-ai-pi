import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';

// PrimeNG Modules
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';

// Shared Components
import { NavbarAuth } from '../../shared/navbar-auth/navbar-auth';
import { Footer } from '../../shared/footer/footer';

// Services
import { Establishment } from '../establishment';

@Component({
  selector: 'app-register-establishment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToastModule,
    CardModule,
    InputTextModule,
    InputMaskModule,
    CheckboxModule,
    ButtonModule,
    FileUploadModule, // Added for p-fileUpload
    NavbarAuth,
    Footer
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterEstablishmentComponent {
  entrepreneurRegisterForm: FormGroup;
  states: { name: string, value: string }[];
  selectedFile: File | null = null; // To store the selected image

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private messageService: MessageService,
    private establishmentService: Establishment // Injected the service
  ) {
    this.entrepreneurRegisterForm = this.fb.group({
      name: ['', Validators.required],
      cpf: ['', Validators.required],
      telefone: ['', Validators.required],
      cep: ['', Validators.required],
      rua: ['', Validators.required],
      numero: ['', Validators.required],
      comple: [''],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', Validators.required],
      termos: [false, Validators.requiredTrue]
    });

    this.states = [
        { name: 'Acre', value: 'AC' },
        { name: 'Alagoas', value: 'AL' },
        { name: 'Amapá', value: 'AP' },
        { name: 'Amazonas', value: 'AM' },
        { name: 'Bahia', value: 'BA' },
        { name: 'Ceará', value: 'CE' },
        { name: 'Distrito Federal', value: 'DF' },
        { name: 'Espírito Santo', value: 'ES' },
        { name: 'Goiás', value: 'GO' },
        { name: 'Maranhão', value: 'MA' },
        { name: 'Mato Grosso', value: 'MT' },
        { name: 'Mato Grosso do Sul', value: 'MS' },
        { name: 'Minas Gerais', value: 'MG' },
        { name: 'Pará', value: 'PA' },
        { name: 'Paraíba', value: 'PB' },
        { name: 'Paraná', value: 'PR' },
        { name: 'Pernambuco', value: 'PE' },
        { name: 'Piauí', value: 'PI' },
        { name: 'Rio de Janeiro', value: 'RJ' },
        { name: 'Rio Grande do Norte', value: 'RN' },
        { name: 'Rio Grande do Sul', value: 'RS' },
        { name: 'Rondônia', value: 'RO' },
        { name: 'Roraima', value: 'RR' },
        { name: 'Santa Catarina', value: 'SC' },
        { name: 'São Paulo', value: 'SP' },
        { name: 'Sergipe', value: 'SE' },
        { name: 'Tocantins', value: 'TO' }
    ];
  }

  // Captures the selected file
  onFileSelect(event: any) {
    const file = event.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  buscarEndereco() {
    const cep = this.entrepreneurRegisterForm.get('cep')?.value;
    if (cep && cep.length === 8) {
      this.http.get(`https://viacep.com.br/ws/${cep}/json/`).subscribe((data: any) => {
        this.entrepreneurRegisterForm.patchValue({
          rua: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf
        });
      });
    }
  }

  registerEntrepreneur() {
    if (!this.entrepreneurRegisterForm.valid) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Por favor, preencha todos os campos obrigatórios.' });
      return;
    }

    // Create FormData to send files and form data together
    const formData = new FormData();
    Object.keys(this.entrepreneurRegisterForm.controls).forEach(key => {
      formData.append(key, this.entrepreneurRegisterForm.get(key)?.value);
    });

    if (this.selectedFile) {
      formData.append('companyImage', this.selectedFile, this.selectedFile.name);
    }

    this.establishmentService.register(formData).subscribe({
      next: (response) => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso!', detail: 'Cadastro realizado com sucesso!' });
        this.clearForm();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro no Cadastro', detail: 'Não foi possível realizar o cadastro. Tente novamente.' });
      }
    });
  }

  clearForm() {
    this.entrepreneurRegisterForm.reset();
    this.selectedFile = null;
    // You might need to add a way to clear the p-fileUpload component visually
  }
}
