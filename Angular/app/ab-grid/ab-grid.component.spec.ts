import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbGridComponent } from './ab-grid.component';

describe('AbGridComponent', () => {
  let component: AbGridComponent;
  let fixture: ComponentFixture<AbGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AbGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
