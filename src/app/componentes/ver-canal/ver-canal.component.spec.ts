import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerCanalComponent } from './ver-canal.component';

describe('VerCanalComponent', () => {
  let component: VerCanalComponent;
  let fixture: ComponentFixture<VerCanalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerCanalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerCanalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
