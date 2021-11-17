import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductGroupsComponent } from './product-groups.component';

describe('ProductGroupsComponent', () => {
  let component: ProductGroupsComponent;
  let fixture: ComponentFixture<ProductGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductGroupsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
