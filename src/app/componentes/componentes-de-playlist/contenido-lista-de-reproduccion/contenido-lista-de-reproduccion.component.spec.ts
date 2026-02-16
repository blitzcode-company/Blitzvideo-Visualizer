import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContenidoListaDeReproduccionComponent } from './contenido-lista-de-reproduccion.component';

describe('ContenidoListaDeReproduccionComponent', () => {
  let component: ContenidoListaDeReproduccionComponent;
  let fixture: ComponentFixture<ContenidoListaDeReproduccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContenidoListaDeReproduccionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContenidoListaDeReproduccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
