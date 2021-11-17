import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewModelDownloadsComponent } from './view-model-downloads.component';

describe('ViewModelDownloadsComponent', () => {
  let component: ViewModelDownloadsComponent;
  let fixture: ComponentFixture<ViewModelDownloadsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewModelDownloadsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewModelDownloadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
