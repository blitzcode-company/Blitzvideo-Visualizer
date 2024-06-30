import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadoDeBusquedaComponent } from './resultado-de-busqueda.component';

describe('ResultadoDeBusquedaComponent', () => {
  let component: ResultadoDeBusquedaComponent;
  let fixture: ComponentFixture<ResultadoDeBusquedaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResultadoDeBusquedaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ResultadoDeBusquedaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
