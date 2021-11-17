import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSecuritiesGridComponent } from './admin-securities-grid.component';

describe('AdminSecuritiesGridComponent', () => {
  let component: AdminSecuritiesGridComponent;
  let fixture: ComponentFixture<AdminSecuritiesGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminSecuritiesGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminSecuritiesGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
