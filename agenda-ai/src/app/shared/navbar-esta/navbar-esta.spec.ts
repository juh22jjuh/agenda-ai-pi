import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarEsta } from './navbar-esta';

describe('NavbarEsta', () => {
  let component: NavbarEsta;
  let fixture: ComponentFixture<NavbarEsta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarEsta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarEsta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
