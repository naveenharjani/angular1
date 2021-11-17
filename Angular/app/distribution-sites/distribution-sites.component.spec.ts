import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributionSitesComponent } from './distribution-sites.component';

describe('DistributionSitesComponent', () => {
  let component: DistributionSitesComponent;
  let fixture: ComponentFixture<DistributionSitesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DistributionSitesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DistributionSitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
