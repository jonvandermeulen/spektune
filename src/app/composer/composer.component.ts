import { Component, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';
import * as Tonal from '@tonaljs/tonal';
import { Composition, Track } from '../interfaces';
import { ComposerHelpersService } from '../services/composer-helpers.service';
import { TrackComponent } from '../track/track.component';
import { MidiService } from '../services/midi.service';
import { PlayerService } from '../services/player.service';
import * as Tone from 'tone';
import { ActivatedRoute } from '@angular/router';
import { DataConversionService } from '../services/data-conversion.service';
import { GuidedTour, GuidedTourService, Orientation } from 'ngx-guided-tour';

@Component({
  selector: 'app-composer',
  templateUrl: './composer.component.html',
  styleUrls: ['./composer.component.scss'],
  viewProviders: [
    TrackComponent,
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
export class ComposerComponent implements OnInit {
  @ViewChildren(TrackComponent) trackComponents: QueryList<TrackComponent>;
  // piano: Piano;

  @Input() model: Composition = {
    name: 'New Composition',
    keyNote: 'C',
    keyScale: 'major pentatonic',
    tempo: 120,
    tracks: [],
    soundfont: 'FluidR3_GM',
  };

  exampleId: string = "";
  keyNoteList: string[] = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  keyScaleNotes: any = [];
  scaleDictionary: any[] = this.composerHelper.getScales();
  playerState: string = 'stopped';
  record: boolean = false;

  composerForm = this.form.group({
    name: this.form.control(this.model?.name),
    keyNote: this.form.control(this.model?.keyNote),
    keyScale: this.form.control(this.model?.keyScale),
    tempo: this.form.control(this.model?.tempo),
    record: this.form.control(false),
  });

  constructor(
    private form: FormBuilder,
    private composerHelper: ComposerHelpersService,
    private midiService: MidiService,
    private playerService: PlayerService,
    private dataService: DataConversionService,
    private router: ActivatedRoute,
    private http: HttpClient,
    private guidedTourService: GuidedTourService
  ) {
    this.trackComponents = new QueryList<TrackComponent>();
    // this.piano = new Piano().toDestination();
  }

  start_tutorial() {
    this.guidedTourService.startTour(this.composerTour);
  }

  playerStatusUpdate(status: string): void {
    this.playerState = status;
  }

  toggleRecording() {
    this.record = !this.record;
    document.getElementById('recordButton')!.style.backgroundColor = (this.record) ? 'red' : 'white';
    this.previewComposition();
  }

  downloadJson(): void {
    this.updateModel();
    const anchor = document.createElement('a');
    anchor.download = `${this.composerForm.get('name')?.value || 'data'}.json`;
    anchor.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.model));
    // console.log(anchor.href);
    anchor.click();
  }

  async fileSelected(event: any): Promise<void> {
    const file: File = event.target.files[0];
    console.log(event);
    if (file) {
      let f: any = await file.arrayBuffer();
      var d = new TextDecoder("utf-8").decode(f);
      this.model = JSON.parse(d);
      this.updateForm();
    }
  }

  async csvSelected(event: any): Promise<void> {
    const file: File = event.target.files[0];
    console.log(event);
    if (file) {
      let f: any = await file.text().then(csvData => {
        // console.log(csvData)
        const data =  this.dataService.parseCsv(csvData);
        // console.log(data)
        // iterate through tracks and add or update as needed
        data.forEach(trackData => {
          let existing = this.model.tracks.find(t => t.name === trackData.name);
          if (existing) {
            existing.data = trackData.data.join('\n');
          } else {
            this.model.tracks.push({
              name: trackData.name,
              key: {
                useGlobalKeyScale: true,
                globalKeyNote: this.model.keyNote,
                globalKeyScale: this.model.keyScale,
                keyNote: this.model.keyNote,
                keyScale: this.model.keyScale,
              },
              options: {},
              data: trackData.data.join('\n'),
              noteData: []
            });
          }
          this.updateModel();
        });
      })
      // this.model = JSON.parse(d);
      // this.updateForm();
    }
  }

  ngOnInit(): void {
    this.exampleId = this.router.snapshot.queryParamMap.get('loadexample') || this.exampleId;
    // console.log(`example id: ${this.exampleId}`)
    if (this.exampleId) {
      this.http.get(`/assets/examples/${this.exampleId}.json`)
        .subscribe((example: any) => {
          this.model = example;
          this.updateForm();
        })
    }
    this.keyChange();
    // this.piano.load();
  }

  ngAfterViewInit(): void {
    if (!this.model.tracks.length) {
      this.addTrack();
    }
  }

  updateModel(): Composition {
    this.model.name = this.composerForm.get("name")?.value;
    this.model.keyNote = this.composerForm.get("keyNote")?.value;
    this.model.keyScale = this.composerForm.get("keyScale")?.value;
    this.model.tempo = this.composerForm.get("tempo")?.value;
    this.model.tracks.forEach((track, index) => {
      this.trackComponents.get(index)?.update();
      track = this.trackComponents.get(index)?.updateModel()!;
      // if (t) {
      //   trks.push(t);
      // } else {
      //   console.log("track mismatch!");
      // }
    })
    // this.model.tracks = this.trackComponents.map(t => {
    //   return t.updateModel();
    // })
    return this.model;
  }

  updateForm(): FormGroup {
    this.composerForm.get("name")?.setValue(this.model.name);
    this.composerForm.get("keyNote")?.setValue(this.model.keyNote);
    this.composerForm.get("keyScale")?.setValue(this.model.keyScale);
    this.composerForm.get("tempo")?.setValue(this.model.tempo);
    this.keyChange();
    return this.composerForm;
  }

  keyChange() {
    console.log('Key Change!');
    this.trackComponents.forEach(track => {
      track.setGlobalKeyScale({ keyNote: this.composerForm.get('keyNote')?.value, keyScale: this.composerForm.get('keyScale')?.value });
      track.keyChange();
    });
    this.keyScaleNotes = Tonal.Scale.get(`${this.composerForm.get('keyNote')?.value} ${this.composerForm.get('keyScale')?.value}`);
  }



  addTrack(): void {
    this.updateModel();
    console.log('add track')
    this.model.tracks.push({
      name: `Track ${this.model.tracks.length + 1}`,
      key: {
        useGlobalKeyScale: true,
        globalKeyNote: this.model.keyNote,
        globalKeyScale: this.model.keyScale,
        keyNote: this.model.keyNote,
        keyScale: this.model.keyScale,
      },
      options: {},
      modulationOptions: [],
      data: [],
      noteData: []
    });

  }

  removeTrack(event: TrackComponent, index: number): void {
    if (confirm('ARE YOU SURE?')) {
      this.model.tracks.splice(index, 1);
    }
    this.updateModel()
  }


  async previewComposition() {
    this.updateModel();
    if (!this.model.tracks.length) {
      alert('No tracks to play!');
    } else {
      await Tone.start();
      if (Tone.Transport.state === "started") {
        Tone.Transport.stop();
        this.stopAllPlayers();
        this.playerState = 'stopped';
        this.record = false;
      } else
        if (this.playerState === 'loading') {
          Tone.Transport.stop();
          this.stopAllPlayers();
          this.playerState = 'stopped';
        } else {
          this.playerState = 'loading';

          const midiTracks: any[] = [];
          this.trackComponents.forEach((track, index) => {
            track.update();
            midiTracks.push(track.createMidiTrack(index + 1));
          });
          const midi = this.midiService.createMidiFile(midiTracks,
            {
              name: this.model.name,
              tempo: this.model.tempo
            });
          this.playerService.loadPreview(midi, { record: this.record }).subscribe(() => {
            Tone.loaded().then(x => {
              this.playerService.playPreview({ record: this.record });
              this.playerState = 'playing';
            })
          });
        }
    }
  }

  async previewTrack(event: TrackComponent, index: number): Promise<void> {
    // load it and play it.
    this.updateModel();
    console.log(event.dataNotes);
    if (!event.dataNotes?.length) {
      alert('No data!');
    } else {
      await Tone.start();
      if (Tone.Transport.state === "started") {
        this.stopAllPlayers();
        Tone.Transport.stop();
        event.playerState = 'stopped';
      } else
        if (event.playerState === 'loading') {
          Tone.Transport.stop();
          this.stopAllPlayers();
          event.playerState = 'stopped';
        } else {
          event.playerState = 'loading';

          const midiTracks: any[] = [];
          midiTracks.push(event.createMidiTrack(index + 1));
          const midi = this.midiService.createMidiFile(midiTracks,
            {
              tempo: this.model.tempo
            });
          this.playerService.loadPreview(midi).subscribe(() => {
            Tone.loaded().then(x => {
              this.playerService.playPreview();
              event.playerState = 'playing';
            })
          });
        }
    }
  }

  stopAllPlayers() {
    Tone.Transport.stop();
    this.playerState = 'stopped'
    this.trackComponents.forEach((track, index) => {
      track.playerState = 'stopped';
    });
  }

  setPlayerState(state: string) {
    this.playerState = state;
  }

  buildMIDI(): void {
    const midiTracks: any[] = [];
    this.trackComponents.forEach((track, index) => {
      track.update();
      midiTracks.push(track.createMidiTrack(index + 1));
    });
    const midi = this.midiService.createMidiFile(midiTracks,
      {
        name: this.model.name,
        tempo: this.model.tempo
      });
    const anchor = document.createElement('a');
    anchor.download = `${this.composerForm.get('name')?.value || 'recording'}.mid`;
    anchor.href = this.midiService.getUri(midi);
    anchor.click();
  }
  public composerTour: GuidedTour = {
    tourId: 'composer-tour',
    useOrb: false,
    steps: [
      // {
      //   title: 'General page step',
      //   content: 'We have the concept of general page steps so that a you can introuce a user to a page or non specific instructions',
      // },
      {
        title: 'Global Key / Scale',
        selector: '.s-key-global',
        content: 'This setting will determine which notes your data will be mapped to. You can override this setting in individual tracks if you wish.',
        orientation: Orientation.Bottom
      },
      {
        title: 'Data Input',
        selector: '.s-data',
        content: 'Paste the data that you would like to turn into music. This should be a single column of numeric data, separated by line-breaks or commas.<br/><br/>Your data will be "normalized" and mapped to notes based on the key/scale and octaves.',
        orientation: Orientation.Top
      },
      {
        title: 'Instrument',
        selector: '.s-instrument',
        content: 'Choose an instrument',
        orientation: Orientation.Top
      },
      {
        title: 'Duration',
        selector: '.s-duration',
        content: 'How long should each data/note play? Example: If your tempo is 120 Beats per Minute, a quarter-note lasts exactly 1/2 second.',
        orientation: Orientation.Top
      },
      {
        title: 'Offset',
        selector: '.s-offset',
        content: 'This setting will delay the start of the track by the specified duration.',
        orientation: Orientation.Top
      },
      {
        title: 'Merge Repeating Notes',
        selector: '.s-merge',
        content: 'Repeating notes can sound... repetative. Make it interesting by merging repeating notes into one longer note.',
        orientation: Orientation.Top
      },
      {
        title: 'Octave Range',
        selector: '.s-octaves',
        content: 'Choose a range of octaves that suits your instrument choice and your data. A wider range of octaves allows for more expression - but don\'t get crazy! Most instruments have a limited range of octaves where they sound good.',
        orientation: Orientation.Top
      },
      {
        title: 'Track Modulation',
        selector: '.s-modulation',
        content: 'Spice up your performance by using data to change the way the instrument is played. (Applies to MIDI export only)',
        orientation: Orientation.Top
      },
      {
        title: 'Preview Track',
        selector: '.s-preview-track',
        content: 'Want to hear what it sounds like? Press play!',
        orientation: Orientation.Top
      },
      {
        title: 'Want to play this on a *real* synthesizer?',
        selector: '.s-download-midi',
        content: 'Download this track as a MIDI file and import it into a proper music studio',
        orientation: Orientation.Top
      },
      {
        title: 'Add a new track',
        selector: '.s-add-track',
        content: 'Add another data stream / instrument',
        orientation: Orientation.Top
      },
      {
        title: 'Save your song',
        selector: '.s-save-song',
        content: 'Backup your data and song.',
        orientation: Orientation.Top
      },
      {
        title: 'Import data from a CSV file',
        selector: '.s-import-data',
        content: 'Have a lot of data? Import it all at once in CSV format.',
        orientation: Orientation.Top
      }
    ]
  };
}
