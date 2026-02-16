import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionDePerfilComponent } from './configuracion-de-perfil.component';

describe('ConfiguracionDePerfilComponent', () => {
  let component: ConfiguracionDePerfilComponent;
  let fixture: ComponentFixture<ConfiguracionDePerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfiguracionDePerfilComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfiguracionDePerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
