import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearListaComponent } from './crear-lista.component';

describe('CrearListaComponent', () => {
  let component: CrearListaComponent;
  let fixture: ComponentFixture<CrearListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrearListaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrearListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
