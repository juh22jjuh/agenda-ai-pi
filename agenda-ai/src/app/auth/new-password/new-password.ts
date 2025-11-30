import { Component } from '@angular/core';
import { NavbarAuth } from '../../shared/navbar-auth/navbar-auth';
import { Footer } from "../../shared/footer/footer";
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';  // <--- IMPORTANTE
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-new-password',
  imports: [NavbarAuth, Footer, FormsModule, CommonModule, ToastModule, PasswordModule],
  templateUrl: './new-password.html',
  styleUrl: './new-password.css'
})
export class NewPassword {

  id: string | null = null;
  token: string | null = null;
  newPassword: string = "";
  confirmPassword: string = "";
  mensagem: string = "";

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id");
    this.token = this.route.snapshot.paramMap.get("token");
    console.log("ID:", this.id);
    console.log("Token:", this.token);
  }

  resetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.mensagem = "As senhas não coincidem!";
      return;
    }

    this.auth.resetPassword(this.id!, this.token!, this.newPassword).subscribe({
      next: () => {
        this.messageService.add({
         severity: 'success',
         summary: 'Senha alterada com sucesso'
      })
      setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) =>  {
        console.log(err)
        this.messageService.add({
              severity: 'error',
              summary: 'Erro ao atualizar senha',
              detail: err.error.error
      })
      }
    });
  }
}
