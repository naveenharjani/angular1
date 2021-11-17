import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminIndustriesGridComponent } from './admin-industries-grid.component';

describe('AdminIndustriesGridComponent', () => {
  let component: AdminIndustriesGridComponent;
  let fixture: ComponentFixture<AdminIndustriesGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminIndustriesGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminIndustriesGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
