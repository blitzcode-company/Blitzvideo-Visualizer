import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReproductorVideoComponent } from './reproductor-video.component';

describe('ReproductorVideoComponent', () => {
  let component: ReproductorVideoComponent;
  let fixture: ComponentFixture<ReproductorVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReproductorVideoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReproductorVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
