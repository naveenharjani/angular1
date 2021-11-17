import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BeehiveFooterComponent } from './beehive-footer.component';

describe('BeehiveFooterComponent', () => {
  let component: BeehiveFooterComponent;
  let fixture: ComponentFixture<BeehiveFooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BeehiveFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BeehiveFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
