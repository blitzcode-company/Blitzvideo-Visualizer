import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContenidoDeComentariosComponent } from './contenido-de-comentarios.component';

describe('ContenidoDeComentariosComponent', () => {
  let component: ContenidoDeComentariosComponent;
  let fixture: ComponentFixture<ContenidoDeComentariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContenidoDeComentariosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContenidoDeComentariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
