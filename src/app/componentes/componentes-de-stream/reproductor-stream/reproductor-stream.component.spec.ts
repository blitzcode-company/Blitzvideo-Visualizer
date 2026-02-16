import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReproductorStreamComponent } from './reproductor-stream.component';

describe('ReproductorStreamComponent', () => {
  let component: ReproductorStreamComponent;
  let fixture: ComponentFixture<ReproductorStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReproductorStreamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReproductorStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
