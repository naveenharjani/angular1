import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecuritiesFormComponent } from './securities-form.component';

describe('SecuritiesFormComponent', () => {
  let component: SecuritiesFormComponent;
  let fixture: ComponentFixture<SecuritiesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecuritiesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecuritiesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
