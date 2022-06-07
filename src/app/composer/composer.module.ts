import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComposerComponent } from './composer.component';
import { TrackComponent } from '../track/track.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from '../tooltip';
import { ExampleComponent } from '../example/example.component';
import { TrackModulationComponent } from '../track-modulation/track-modulation.component';
import { GuidedTourModule, GuidedTourService } from 'ngx-guided-tour';

@NgModule({
  declarations: [
    ComposerComponent,
    TrackComponent,
    TrackModulationComponent,
    ExampleComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TooltipModule,
    GuidedTourModule,
  ],
  exports: [
    ComposerComponent
  ],
  providers: [
    GuidedTourService
  ]
})
export class ComposerModule {

}
