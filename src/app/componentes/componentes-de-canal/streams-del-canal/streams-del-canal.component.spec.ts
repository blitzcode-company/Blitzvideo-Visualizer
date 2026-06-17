import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamsDelCanalComponent } from './streams-del-canal.component';

describe('StreamsDelCanalComponent', () => {
  let component: StreamsDelCanalComponent;
  let fixture: ComponentFixture<StreamsDelCanalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StreamsDelCanalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StreamsDelCanalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
