import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideosDeEtiquetaComponent } from './videos-de-etiqueta.component';

describe('VideosDeEtiquetaComponent', () => {
  let component: VideosDeEtiquetaComponent;
  let fixture: ComponentFixture<VideosDeEtiquetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VideosDeEtiquetaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VideosDeEtiquetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
