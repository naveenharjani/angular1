import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BeehivePageHeaderComponent } from './beehive-page-header.component';

describe('BeehivePageHeaderComponent', () => {
  let component: BeehivePageHeaderComponent;
  let fixture: ComponentFixture<BeehivePageHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BeehivePageHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BeehivePageHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
