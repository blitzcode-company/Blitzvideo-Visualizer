import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalReporteVideoComponent } from './modal-reporte-video.component';

describe('ModalReporteVideoComponent', () => {
  let component: ModalReporteVideoComponent;
  let fixture: ComponentFixture<ModalReporteVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalReporteVideoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalReporteVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
