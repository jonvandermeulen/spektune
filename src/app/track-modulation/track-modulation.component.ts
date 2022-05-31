import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Duration } from '../interfaces';
import { ModulationOption } from '../interfaces/track';
import { ComposerHelpersService } from '../services/composer-helpers.service';
import { DataConversionService } from '../services/data-conversion.service';
import { MidiService } from '../services/midi.service';

@Component({
  selector: 'app-track-modulation',
  templateUrl: './track-modulation.component.html',
  styleUrls: ['./track-modulation.component.scss']
})
export class TrackModulationComponent implements OnInit {
  @Input() model: ModulationOption = { type: '', minValue: 0, maxValue: 127, duration: Duration.fromName('quarter')!, options: {}, data: []};
  @Output() outputData: any[] = [];
  @Output() removeModulationEventHandler: EventEmitter<TrackModulationComponent> = new EventEmitter();

  modulationTypes: any[] = [{
      id: 'modulation',
      name: 'Modulation'
    }, {
      id: 'velocity',
      name: 'Velocity'
    }, {
      id: 'expression',
      name: 'Expression'
    }, {
      id: 'aftertouch',
      name: 'Aftertouch/Pressure'
    }, {
      id: 'cutoff',
      name: 'Cutoff'
    }, {
      id: 'resonance',
      name: 'Resonance'
    }, {
      id: 'attack',
      name: 'Attack'
    }, {
      id: 'decay',
      name: 'Decay'
    }];
  durationDictionary: any[] = this.composerHelper.durationDictionary();
  modForm = this.form.group({
      modulationType: this.form.control('modulation'),
      duration: this.form.control('4'),
      dataInput: this.form.control(''),
      mergeLimit: this.form.control(0),
      rangeMin: this.form.control(0),
      rangeMax: this.form.control(127),
    });


  constructor(private form: FormBuilder,
    private composerHelper: ComposerHelpersService,
    private dataConverter: DataConversionService,
    private midiService: MidiService) { 
      this.modelToForm();
    }

  ngOnInit(): void {
    this.modelToForm();
  }

  update() {
    // nothing really to do here
  }

  updateModel(): ModulationOption {
    this.model.type = this.modForm.get('modulationType')?.value;
    this.model.duration = new Duration(this.modForm.get('duration')?.value)
    this.model.minValue = this.modForm.get('rangeMin')?.value;
    this.model.maxValue = this.modForm.get('rangeMax')?.value;
    this.model.data = this.modForm.get('dataInput')?.value;
    return this.model;
  }

  modelToForm() {
    this.modForm.get('modulationType')?.setValue(this.model.type || this.modForm.get('modulationType')?.value);
    this.modForm.get('duration')?.setValue(this.model.duration.name || this.modForm.get('duration')?.value);
    this.modForm.get('rangeMin')?.setValue(this.model.minValue || this.modForm.get('rangeMin')?.value);
    this.modForm.get('rangeMax')?.setValue(this.model.maxValue || this.modForm.get('rangeMax')?.value);
    this.modForm.get('dataInput')?.setValue(this.model.data || this.modForm.get('dataInput')?.value);
  }


  removeModulation(event?: any): void {
    this.removeModulationEventHandler.emit(this);
  }

  range(min: number, max: number, step?: number): number[] {
    step = step || 1;
    const input = [];
    for (var i = min; i <= max; i += step) { input.push(i); }
    return input;
  };

}
