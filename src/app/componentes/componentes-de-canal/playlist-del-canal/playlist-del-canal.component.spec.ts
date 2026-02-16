import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistDelCanalComponent } from './playlist-del-canal.component';

describe('PlaylistDelCanalComponent', () => {
  let component: PlaylistDelCanalComponent;
  let fixture: ComponentFixture<PlaylistDelCanalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlaylistDelCanalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlaylistDelCanalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
