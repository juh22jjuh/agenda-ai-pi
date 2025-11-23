import { Footer } from './../../shared/footer/footer';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../auth/auth';
import { HttpClient } from '@angular/common/http';
import { MySchedules } from './my-schedules';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FileUploadModule } from 'primeng/fileupload';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { NavbarAuth } from '../../shared/navbar-auth/navbar-auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarAuth,
    Footer,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    FileUploadModule,
    AvatarModule,
    DividerModule,
    MySchedules
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  user: any;
  activeTab: string = 'minhaConta';
  showEditForm = false;
  updatedUser: any = {};
  profileImageUrl: string = 'URL_da_IMAGEM_PADRAO';
  senhaAtual: string = '';
  novaSenha: string = '';
  confirmarSenha: string = '';

  constructor(private authService: Auth, private http: HttpClient) { }

  ngOnInit() {
    const { user } = this.authService.getUserData();
    this.user = user;
    this.updatedUser = { ...user };
  }

  selectTab(tab: string) {
    this.activeTab = tab;
  }

  toggleEditForm() {
    this.showEditForm = !this.showEditForm;
  }

  salvarInfoPessoal() {
    this.http.put(`http://localhost:3000/api/user/${this.user._id}`, this.user).subscribe(
      (response: any) => {
        this.user = response;
        this.authService.updateUser(response);
        this.showEditForm = false;
      },
      (error) => {
        console.error('Erro ao atualizar usuário:', error);
      }
    );
  }

  alterarFoto(event: any) {
    const file = event.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profileImage', file);

      this.http.put(`http://localhost:3000/api/user/update-photo/${this.user._id}`, formData).subscribe(
        (response: any) => {
          window.location.reload();
        },
        (error) => {
          console.error('Erro ao atualizar a foto:', error);
        }
      );
    }
  }

  alterarSenha(senhaAtual: string, novaSenha: string, confirmarSenha: string) {
    if (novaSenha !== confirmarSenha) {
      console.error('A nova senha e a confirmação não correspondem.');
      return;
    }
    // Lógica para chamar o backend para alterar a senha
    console.log('Enviando pedido para alterar a senha...');
  }
}
