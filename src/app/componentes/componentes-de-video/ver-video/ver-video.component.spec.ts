import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerVideoComponent } from './ver-video.component';

describe('VerVideoComponent', () => {
  let component: VerVideoComponent;
  let fixture: ComponentFixture<VerVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerVideoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
