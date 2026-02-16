import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaDeReproduccionComponent } from './lista-de-reproduccion.component';

describe('ListaDeReproduccionComponent', () => {
  let component: ListaDeReproduccionComponent;
  let fixture: ComponentFixture<ListaDeReproduccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListaDeReproduccionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListaDeReproduccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
