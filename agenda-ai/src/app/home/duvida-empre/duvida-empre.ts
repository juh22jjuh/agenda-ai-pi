import { Component } from '@angular/core';
import { NavbarAuth } from '../../shared/navbar-auth/navbar-auth';
import { Footer } from '../../shared/footer/footer';


@Component({
  selector: 'app-duvida-empre',
  imports: [NavbarAuth, Footer],
  templateUrl: './duvida-empre.html',
  styleUrl:'./duvida-empre.css',
})
export class DuvidaEmpre {

}
