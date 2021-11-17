import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchAdvanceSearchComponent } from './research-advance-search.component';

describe('ResearchAdvanceSearchComponent', () => {
  let component: ResearchAdvanceSearchComponent;
  let fixture: ComponentFixture<ResearchAdvanceSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResearchAdvanceSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResearchAdvanceSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
