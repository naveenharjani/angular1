import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchCoverageComponent } from './research-coverage.component';

describe('ResearchCoverageComponent', () => {
  let component: ResearchCoverageComponent;
  let fixture: ComponentFixture<ResearchCoverageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResearchCoverageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResearchCoverageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
