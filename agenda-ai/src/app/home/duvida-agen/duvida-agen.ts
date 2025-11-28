import { Component } from '@angular/core';
import { NavbarAuth } from "../../shared/navbar-auth/navbar-auth";
import { Footer } from '../../shared/footer/footer';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-duvida-agen',
  imports: [NavbarAuth, Footer, RouterLink, RouterLinkActive],
  templateUrl: './duvida-agen.html',
  styleUrl: './duvida-agen.css',
})
export class DuvidaAgen {

}
