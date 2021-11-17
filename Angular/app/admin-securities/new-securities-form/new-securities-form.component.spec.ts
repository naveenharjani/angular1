import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSecuritiesFormComponent } from './new-securities-form.component';

describe('NewSecuritiesFormComponent', () => {
  let component: NewSecuritiesFormComponent;
  let fixture: ComponentFixture<NewSecuritiesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewSecuritiesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewSecuritiesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
