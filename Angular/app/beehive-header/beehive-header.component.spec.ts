import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BeehiveHeaderComponent } from './beehive-header.component';

describe('BeehiveHeaderComponent', () => {
  let component: BeehiveHeaderComponent;
  let fixture: ComponentFixture<BeehiveHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BeehiveHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BeehiveHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
