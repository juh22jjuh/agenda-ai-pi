import { Component } from '@angular/core';
import { NavbarAuth } from '../../shared/navbar-auth/navbar-auth';
import { Footer } from "../../shared/footer/footer";
import { RouterLink } from '@angular/router';
import { Auth } from '../auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-forgot-password',
  imports: [NavbarAuth, Footer, RouterLink, FormsModule, CommonModule, ToastModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {

  email: string = "";
  mensagem: string = "";

  constructor(private auth: Auth, private messageService: MessageService) {}

  enviarEmail() {
    this.auth.requestResetPassword(this.email).subscribe({
      next: () => {
        this.messageService.add({
              severity: 'success',
              summary: 'Link Enviado com Sucesso',
              detail: 'O link para redefinir senha foi enviado com sucesso!',
        });
      },
      error: err => {
        if (err.status === 404) {
          this.messageService.add({
              severity: 'error',
              summary: 'Erro ao Enviar Link',
              detail: 'Email inválido!',
          })
        } else {
          this.messageService.add({
              severity: 'error',
              summary: 'Erro ao Enviar Link',
              detail: err?.error?.error,
          })
        }
      }
    });
  }
}
