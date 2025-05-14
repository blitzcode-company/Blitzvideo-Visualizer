import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerStreamComponent } from './ver-stream.component';

describe('VerStreamComponent', () => {
  let component: VerStreamComponent;
  let fixture: ComponentFixture<VerStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerStreamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
