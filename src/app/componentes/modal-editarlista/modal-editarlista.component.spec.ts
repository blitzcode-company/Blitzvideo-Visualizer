import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditarlistaComponent } from './modal-editarlista.component';

describe('ModalEditarlistaComponent', () => {
  let component: ModalEditarlistaComponent;
  let fixture: ComponentFixture<ModalEditarlistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalEditarlistaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalEditarlistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
