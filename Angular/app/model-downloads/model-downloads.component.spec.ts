import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelDownloadsComponent } from './model-downloads.component';

describe('ModelDownloadsComponent', () => {
  let component: ModelDownloadsComponent;
  let fixture: ComponentFixture<ModelDownloadsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelDownloadsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelDownloadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
