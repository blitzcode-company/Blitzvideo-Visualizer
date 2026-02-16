import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoCanalComponent } from './info-canal.component';

describe('InfoCanalComponent', () => {
  let component: InfoCanalComponent;
  let fixture: ComponentFixture<InfoCanalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InfoCanalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InfoCanalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
