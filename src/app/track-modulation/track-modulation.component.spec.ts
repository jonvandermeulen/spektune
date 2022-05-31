import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackModulationComponent } from './track-modulation.component';

describe('TrackModulationComponent', () => {
  let component: TrackModulationComponent;
  let fixture: ComponentFixture<TrackModulationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrackModulationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackModulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
