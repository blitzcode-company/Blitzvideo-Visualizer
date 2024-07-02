import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideosDelCanalComponent } from './videos-del-canal.component';

describe('VideosDelCanalComponent', () => {
  let component: VideosDelCanalComponent;
  let fixture: ComponentFixture<VideosDelCanalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VideosDelCanalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VideosDelCanalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
