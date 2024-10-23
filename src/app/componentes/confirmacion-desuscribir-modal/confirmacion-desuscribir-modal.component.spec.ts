import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmacionDesuscribirModalComponent } from './confirmacion-desuscribir-modal.component';

describe('ConfirmacionDesuscribirModalComponent', () => {
  let component: ConfirmacionDesuscribirModalComponent;
  let fixture: ComponentFixture<ConfirmacionDesuscribirModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfirmacionDesuscribirModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmacionDesuscribirModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
