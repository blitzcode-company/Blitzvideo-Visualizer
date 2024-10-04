import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearListaReproduccionComponent } from './crear-lista-reproduccion.component';

describe('CrearListaReproduccionComponent', () => {
  let component: CrearListaReproduccionComponent;
  let fixture: ComponentFixture<CrearListaReproduccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrearListaReproduccionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrearListaReproduccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
