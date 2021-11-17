import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentUsageComponent } from './content-usage.component';

describe('ContentUsageComponent', () => {
  let component: ContentUsageComponent;
  let fixture: ComponentFixture<ContentUsageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentUsageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
