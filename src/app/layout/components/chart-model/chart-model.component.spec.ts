/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ChartModelComponent } from './chart-model.component';

describe('ChartModelComponent', () => {
  let component: ChartModelComponent;
  let fixture: ComponentFixture<ChartModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
