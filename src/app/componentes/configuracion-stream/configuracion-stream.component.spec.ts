import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionStreamComponent } from './configuracion-stream.component';

describe('ConfiguracionStreamComponent', () => {
  let component: ConfiguracionStreamComponent;
  let fixture: ComponentFixture<ConfiguracionStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfiguracionStreamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfiguracionStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
