import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalReporteComentarioComponent } from './modal-reporte-comentario.component';

describe('ModalReporteComentarioComponent', () => {
  let component: ModalReporteComentarioComponent;
  let fixture: ComponentFixture<ModalReporteComentarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalReporteComentarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalReporteComentarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
