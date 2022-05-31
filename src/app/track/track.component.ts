import { Component, Input, OnInit, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';
import * as Tonal from '@tonaljs/tonal';
import { Duration, Note, Track } from '../interfaces';
import { ComposerHelpersService } from '../services/composer-helpers.service';
import { DataConversionService } from '../services/data-conversion.service';
import { MidiService } from '../services/midi.service';
import { TrackModulationComponent } from '../track-modulation/track-modulation.component';
const JZZ = require('jzz');
require('jzz-midi-smf')(JZZ);

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss'],
  viewProviders: [
    TrackModulationComponent,
  ],
  animations: [
    // the fade-in/fade-out animation.
    // the trigger name does not matter, but it must match the name of the [@...] attribute in the template.
    trigger('fade', [

      // the "in" style determines the "resting" state of the element when it is visible.
      // the style name "in" must match the value of the [@simpleFadeAnimation]="'in'" attribute in the template
      state('in', style({ opacity: 1 })),

      // fade in when created. this could also be written as transition('void => *')
      transition('void => *', [
        // the styles start from this point when the element appears
        style({ opacity: 0 }),
        // and animate toward the "in" state above
        animate(600)
      ]),

      // fade out when destroyed. this could also be written as transition('void => *')
      transition('* => void',
        // fading out uses a different syntax, with the "style" being passed into animate()
        animate("600ms linear", style({ opacity: 0, height: 0 })))
    ])
  ]
})
export class TrackComponent implements OnInit {
  @Input() model: Track = { key: {}, options: {}, data: [], noteData: [] };
  @Output() outputData: Note[] = [];
  @Output() removeTrackEventHandler: EventEmitter<TrackComponent> = new EventEmitter();
  @Output() previewTrackEventHandler: EventEmitter<TrackComponent> = new EventEmitter();
  @ViewChildren(TrackModulationComponent) trackModComponents: QueryList<TrackModulationComponent>;

  noteInput: string = "";
  keyNoteList: string[] = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  keyScaleNotes: any = [];
  keyScaleChords: any = [];
  scaleDictionary: any[] = this.composerHelper.getScales();
  useGlobalKeyScale: boolean = true;
  globalKeyNote: string = "";
  globalKeyScale: string = "";
  notesCollection: any[] = [];
  dataNotes: Note[] = [];
  processedDataString: string = '';
  midiInstrumentList: any[] = [];
  durationDictionary: any[] = this.composerHelper.durationDictionary();
  playerState: string = 'stopped';

  trackForm = this.form.group({
    keyForm: this.form.group({
      useGlobal: this.form.control(true),
      globalKeyNote: this.form.control(''),
      globalKeyScale: this.form.control(''),
      keyNote: this.form.control(''),
      keyScale: this.form.control(''),
      startOctave: this.form.control(2),
      endOctave: this.form.control(4),
    }),
    drumform: this.form.group({
      keyNote: this.form.control(''),
      drumSelect: this.form.control(''),
      patternSelect: this.form.control(''), // optional?
      quantize: this.form.control(''),
    }),
    dataForm: this.form.group({
      dataInput: this.form.control(''),
    }),
    optionsForm: this.form.group({
      name: this.form.control(''),
      tempo: this.form.control(''),
      midiInstrument: this.form.control(1),
      noteDuration: this.form.control('quarter'),
      mergeLimit: this.form.control(0),
      restNotes: this.form.control(''),
      offset: this.form.control(0),
      sustain: this.form.control(false),
      volume: this.form.control(70),
      defaultVelocity: this.form.control(70),
    }),
  })

  constructor(
    private form: FormBuilder,
    private composerHelper: ComposerHelpersService,
    private dataConverter: DataConversionService,
    private midiService: MidiService) {
    this.trackModComponents = new QueryList<TrackModulationComponent>();
    this.midiInstrumentList = composerHelper.midiInstrumentDictionary();
    this.modelToForm();
    this.keyChange();
  }

  ngOnInit(): void {
    this.modelToForm();
    this.keyChange();
  }

  // ngAfterViewChecked(): void {
  //   // this.modelToForm();
  //   this.keyChange();
  // } 


  update(): void {
    // Tone.Transport.stop();
    const input = this.trackForm.get('dataForm.dataInput')?.value || '';
    if (input.length <= 0) {
      console.log('no input!');
      this.dataNotes = [];
    } else {

      const data = this.dataConverter.convertRawInput(input);
      // console.log('data: ');
      // console.log(data);
      const normalData = this.dataConverter.normalizeData(data)
      const duration = new Duration(this.trackForm.get('optionsForm.noteDuration')?.value);

      this.dataNotes = this.composerHelper.createNotesFromData(
        normalData,
        this.notesCollection,
        duration,
        { 
          rawData: data,
          modulationOptions: this.model.modulationOptions,
          restNotes: this.model.options.restNotes,
          defaultVelocity: this.model.options.defaultVelocity,
        }
      );
      this.outputData = this.composerHelper.mergeNotes(
        this.dataNotes,
        {
          mergeLimit: this.trackForm.get('optionsForm.mergeLimit')!.value,
          modulationOptions: this.model.modulationOptions,
          offset: this.trackForm.get('optionsForm.offset')?.value || 0,
        }
      );
      this.processedDataString = JSON.stringify(this.outputData)
    }
  }

  setGlobalKeyScale(opt: any) {
    console.log('setGlobalKeyScale');
    console.log(opt);
    this.model.key.useGlobalKeyScale = this.trackForm.get('keyForm.useGlobal')?.value || false;
    if (opt?.keyNote && opt?.keyScale) {
      this.model.key.globalKeyNote = opt.keyNote;
      this.model.key.globalKeyScale = opt.keyScale;
    }
    if (this.model.key.useGlobalKeyScale) {
      this.trackForm.get('keyForm.keyNote')?.setValue(this.globalKeyNote);
      this.trackForm.get('keyForm.keyScale')?.setValue(this.globalKeyScale);
    }
  }

  modelToForm() {
    this.trackForm.get('optionsForm.name')?.setValue(this.model.name || this.trackForm.get('optionsForm.name')?.value);
    this.trackForm.get('optionsForm.midiInstrument')?.setValue(this.model.midiInstrumentId || this.trackForm.get('optionsForm.midiInstrument')?.value);
    this.trackForm.get('optionsForm.noteDuration')?.setValue(this.model.options?.noteDuration || this.trackForm.get('optionsForm.noteDuration')?.value);
    this.trackForm.get('optionsForm.mergeLimit')?.setValue(this.model.options?.mergeLimit || this.trackForm.get('optionsForm.mergeLimit')?.value);
    this.trackForm.get('optionsForm.restNotes')?.setValue(this.model.options?.restNotes || this.trackForm.get('optionsForm.restNotes')?.value);
    this.trackForm.get('optionsForm.offset')?.setValue(this.model.options?.offset || this.trackForm.get('optionsForm.offset')?.value);
    this.trackForm.get('optionsForm.sustain')?.setValue(this.model.options?.sustain || this.trackForm.get('optionsForm.sustain')?.value);
    this.trackForm.get('optionsForm.volume')?.setValue(this.model.options?.volume || this.trackForm.get('optionsForm.volume')?.value);
    this.trackForm.get('optionsForm.defaultVelocity')?.setValue(this.model.options?.defaultVelocity || this.trackForm.get('optionsForm.defaultVelocity')?.value);
    this.trackForm.get('keyForm.useGlobal')?.setValue(this.model.key?.useGlobalKeyScale || this.trackForm.get('keyForm.useGlobal')?.value);
    if (this.model.key?.useGlobalKeyScale) {
      this.trackForm.get('keyForm.keyNote')?.setValue(this.model.key.globalKeyNote || this.model.key?.keyNote);
      this.trackForm.get('keyForm.keyScale')?.setValue(this.model.key.globalKeyScale || this.model.key?.keyNote);
    } else {
      this.trackForm.get('keyForm.keyNote')?.setValue(this.model.key?.keyNote || this.trackForm.get('keyForm.keyNote')?.value);
      this.trackForm.get('keyForm.keyScale')?.setValue(this.model.key?.keyScale || this.trackForm.get('keyForm.keyScale')?.value);
    }
    this.trackForm.get('keyForm.startOctave')?.setValue(this.model.key?.startOctave || this.trackForm.get('keyForm.startOctave')?.value);
    this.trackForm.get('keyForm.endOctave')?.setValue(this.model.key?.endOctave || this.trackForm.get('keyForm.endOctave')?.value);
    if (this.model.data) {
      this.trackForm.get('dataForm.dataInput')?.setValue(this.model.data);
    }
    this.keyChange();
  }

  updateModel(): Track {
    this.keyChange();
    this.update();
    this.model.name = this.trackForm.get('optionsForm.name')?.value;
    this.model.midiInstrumentId = this.trackForm.get('optionsForm.midiInstrument')?.value;
    this.model.options.noteDuration = this.trackForm.get('optionsForm.noteDuration')?.value;
    this.model.options.mergeLimit = this.trackForm.get('optionsForm.mergeLimit')?.value;
    this.model.options.restNotes = this.trackForm.get('optionsForm.restNotes')?.value;
    this.model.options.offset = this.trackForm.get('optionsForm.offset')?.value;
    this.model.options.sustain = this.trackForm.get('optionsForm.sustain')?.value;
    this.model.options.volume = this.trackForm.get('optionsForm.volume')?.value;
    this.model.options.defaultVelocity = this.trackForm.get('optionsForm.defaultVelocity')?.value;
    this.model.key.useGlobalKeyScale = this.trackForm.get('keyForm.useGlobal')?.value || false;
    this.model.key.keyNote = this.trackForm.get('keyForm.keyNote')?.value;
    this.model.key.keyScale = this.trackForm.get('keyForm.keyScale')?.value;
    this.model.key.startOctave = this.trackForm.get('keyForm.startOctave')?.value;
    this.model.key.endOctave = this.trackForm.get('keyForm.endOctave')?.value;
    this.model.data = this.trackForm.get('dataForm.dataInput')?.value;
    this.model.noteData = this.outputData;
    // modulation options
    let mods = []
    this.model.modulationOptions?.forEach((mod, index) => {
      this.trackModComponents.get(index)?.update();
      mod = this.trackModComponents.get(index)!.updateModel();
    })
    return this.model;
  }

  createMidiTrack(channel?: number): any {
    this.updateModel();
    this.update();

    let options: any = {
      channel: channel || 1,
      name: this.model.name,
      midiInstrumentId: this.model.midiInstrumentId,
      mergeLimit: this.model.options.mergeLimit,
      noteDuration: this.model.options.noteDuration,
      tempo: this.model.options.tempo,
      offset: this.model.options.offset,
      sustain: this.model.options.sustain,
      // volume: this.model.options.volume,
      defaultVelocity: this.model.options.defaultVelocity,
      modulationOptions: this.model.modulationOptions,
    };

    return this.midiService.createMidiTrack(this.outputData, options);
  }

  downloadMidi(): void {
    const track = this.createMidiTrack();
    const smf = this.midiService.createMidiFile([track]);
    const anchor = document.createElement('a');
    anchor.download = `${this.trackForm.get('optionsForm.name')?.value || 'recording'}.mid`;
    anchor.href = this.midiService.getUri(smf);
    anchor.click();
  }

  downloadJson(): void {
    this.update();
    this.updateModel();
    const anchor = document.createElement('a');
    anchor.download = `${this.trackForm.get('optionsForm.name')?.value || 'data'}.json`;
    anchor.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.model));
    // console.log(anchor.href);
    anchor.click();
  }

  downloadCSV(): void {
    this.update();
    this.updateModel();
    const csv = this.composerHelper.createCSVFromNotes(this.model.noteData);
    const anchor = document.createElement('a');
    anchor.download = `${this.trackForm.get('optionsForm.name')?.value || 'data'}.csv`;
    anchor.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv);
    // console.log(anchor.href);
    anchor.click();
  }

  keyChange() {
    console.log('Key Change!');
    if (this.trackForm.get('keyForm.useGlobal')?.value) {
      this.trackForm.get('keyForm.keyNote')?.setValue(this.model.key.globalKeyNote);
      this.trackForm.get('keyForm.keyScale')?.setValue(this.model.key.globalKeyScale);
    }
    this.keyScaleNotes = Tonal.Scale.get(`${this.trackForm.get('keyForm.keyNote')?.value} ${this.trackForm.get('keyForm.keyScale')?.value}`);
    this.notesCollection = this.composerHelper.createNotesCollection(this.keyScaleNotes.notes, this.trackForm.get('keyForm.startOctave')?.value, this.trackForm.get('keyForm.endOctave')?.value);
    this.keyScaleChords = Tonal.Scale.scaleChords(this.trackForm.get('keyScale')?.value);
  }

  octaveChange() {
    console.log(this.trackForm.get('keyForm.startOctave')?.value);
    console.log(this.trackForm.get('keyForm.endOctave')?.value);
    this.notesCollection = this.composerHelper.createNotesCollection(this.keyScaleNotes.notes, this.trackForm.get('keyForm.startOctave')?.value, this.trackForm.get('keyForm.endOctave')?.value);
  }

  range(min: number, max: number, step?: number): number[] {
    step = step || 1;
    const input = [];
    for (var i = min; i <= max; i += step) { input.push(i); }
    return input;
  };

  deleteTrack(event?: any): void {
    this.removeTrackEventHandler.emit(this);
  }

  previewTrack(event?: any): void {
    // this.playerState = 'stopped';
    console.log('previewTrack');
    this.previewTrackEventHandler.emit(this);
  }

  addTrackModulation(): void {
    this.updateModel();
    console.log('add track modulation')
    this.model.modulationOptions = this.model.modulationOptions || [];
    this.model.modulationOptions!.push({
      type: '',
      duration: this.model.options.noteDuration || Duration.fromName('quarter')!,
      minValue: 0,
      maxValue: 127,
      options: {},
      data: [],
    });
  }

  removeTrackModulation(event: TrackModulationComponent, index: number): void {
    if (confirm('ARE YOU SURE?')) {
      this.model.modulationOptions!.splice(index, 1);
    }
    this.updateModel()
  }
}
