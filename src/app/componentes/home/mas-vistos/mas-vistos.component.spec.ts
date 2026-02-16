import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasVistosComponent } from './mas-vistos.component';

describe('MasVistosComponent', () => {
  let component: MasVistosComponent;
  let fixture: ComponentFixture<MasVistosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MasVistosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MasVistosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
