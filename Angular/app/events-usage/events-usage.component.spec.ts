import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsUsageComponent } from './events-usage.component';

describe('EventsUsageComponent', () => {
  let component: EventsUsageComponent;
  let fixture: ComponentFixture<EventsUsageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventsUsageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
