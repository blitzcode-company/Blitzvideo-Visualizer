import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioRequeridoComponent } from './usuario-requerido.component';

describe('UsuarioRequeridoComponent', () => {
  let component: UsuarioRequeridoComponent;
  let fixture: ComponentFixture<UsuarioRequeridoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UsuarioRequeridoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsuarioRequeridoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
