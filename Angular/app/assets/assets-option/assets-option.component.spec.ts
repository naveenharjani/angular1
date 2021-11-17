import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsOptionComponent } from './assets-option.component';

describe('AssetsOptionComponent', () => {
  let component: AssetsOptionComponent;
  let fixture: ComponentFixture<AssetsOptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetsOptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetsOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
