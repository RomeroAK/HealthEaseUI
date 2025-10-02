import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrscriptionsComponent } from './prescriptions.component';

describe('PrscriptionsComponent', () => {
  let component: PrscriptionsComponent;
  let fixture: ComponentFixture<PrscriptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrscriptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrscriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
