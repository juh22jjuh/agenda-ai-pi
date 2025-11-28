import { Component } from '@angular/core';
import { Footer } from '../../shared/footer/footer';
import { NavbarAuth } from "../../shared/navbar-auth/navbar-auth";


@Component({
  selector: 'app-duvida-empre',
  imports: [ Footer, NavbarAuth],
  templateUrl: './duvida-empre.html',
  styleUrl:'./duvida-empre.css',
})
export class DuvidaEmpre {

}
