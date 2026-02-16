import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraciasModalComponent } from './gracias-modal.component';

describe('GraciasModalComponent', () => {
  let component: GraciasModalComponent;
  let fixture: ComponentFixture<GraciasModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GraciasModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GraciasModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
