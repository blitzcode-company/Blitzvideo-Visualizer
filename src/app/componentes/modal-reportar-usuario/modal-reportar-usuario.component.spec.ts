import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalReportarUsuarioComponent } from './modal-reportar-usuario.component';

describe('ModalReportarUsuarioComponent', () => {
  let component: ModalReportarUsuarioComponent;
  let fixture: ComponentFixture<ModalReportarUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalReportarUsuarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalReportarUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
