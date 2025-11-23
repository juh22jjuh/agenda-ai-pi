import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-register-establishment',
  templateUrl: './register.html',
  styleUrls: ['./register.css'] // Added this line
})
export class RegisterEstablishmentComponent {
  entrepreneurRegisterForm: FormGroup;
  states: { name: string, value: string }[];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private messageService: MessageService
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
    if (this.entrepreneurRegisterForm.valid) {
      // Implement your registration logic here
      console.log(this.entrepreneurRegisterForm.value);
      this.messageService.add({ severity: 'success', summary: 'Sucesso!', detail: 'Cadastro realizado com sucesso!' });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Por favor, preencha todos os campos obrigatórios.' });
    }
  }

  clearForm() {
    this.entrepreneurRegisterForm.reset();
  }
}
