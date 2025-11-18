import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatDeStreamComponent } from './chat-de-stream.component';

describe('ChatDeStreamComponent', () => {
  let component: ChatDeStreamComponent;
  let fixture: ComponentFixture<ChatDeStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChatDeStreamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatDeStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
