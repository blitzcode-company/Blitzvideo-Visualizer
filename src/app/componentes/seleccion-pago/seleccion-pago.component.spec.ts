import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionPagoComponent } from './seleccion-pago.component';

describe('SeleccionPagoComponent', () => {
  let component: SeleccionPagoComponent;
  let fixture: ComponentFixture<SeleccionPagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SeleccionPagoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SeleccionPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
