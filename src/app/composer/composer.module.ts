import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComposerComponent } from './composer.component';
import { TrackComponent } from '../track/track.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from '../tooltip';
import { ExampleComponent } from '../example/example.component';
import { TrackModulationComponent } from '../track-modulation/track-modulation.component';

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
  ],
  exports: [
    ComposerComponent
  ],
  providers: []
})
export class ComposerModule {

}
