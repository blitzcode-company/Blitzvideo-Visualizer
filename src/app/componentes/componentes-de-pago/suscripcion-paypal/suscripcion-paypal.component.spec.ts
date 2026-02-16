import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuscripcionPaypalComponent } from './suscripcion-paypal.component';

describe('SuscripcionPaypalComponent', () => {
  let component: SuscripcionPaypalComponent;
  let fixture: ComponentFixture<SuscripcionPaypalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuscripcionPaypalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuscripcionPaypalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
