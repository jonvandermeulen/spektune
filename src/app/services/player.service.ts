import { EventEmitter, Injectable } from '@angular/core';
import * as Tone from 'tone';
import { Piano } from '@tonejs/piano';
import { Midi } from '@tonejs/midi';
import { SoundfontService } from './soundfont.service';
import { firstValueFrom, forkJoin, map, Observable, of } from 'rxjs';
const recorder = new Tone.Recorder();
import { SoundFontType } from '../interfaces/composition';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  names?: string[];
  instruments: {name: string, sampler: Tone.Sampler}[] = [];
  playerStatusEventHandler: EventEmitter<string> = new EventEmitter();
  status: string = "stopped";
  reverb = new Tone.Reverb({
    wet: 1,
    decay: 1.5,
    preDelay: 0.01
  }).toDestination();
  

  

  constructor(
    private soundfont: SoundfontService
  ) { 
    // this.piano = new Piano().toDestination();
    // this.piano.load();
    this.soundfont.soundfontType = 'FluidR3_GM';
    this.soundfont.getNames().subscribe(s => {
      this.names = s;
    });
  }

  setSoundfont(name: SoundFontType) {
    this.soundfont.soundfontType = name;
  }

  playerStatus(status: string): void {
    this.playerStatusEventHandler.emit(status);
  }

  getOrLoadSampler(instrumentName: string): Observable<Tone.Sampler> {
    let inst = this.instruments.find(i => i.name === instrumentName);
    if (inst) {
      console.log(`${instrumentName} found`);
      return of(inst.sampler);
    } else {
      return this.soundfont.getSamplerDef(instrumentName).pipe(
        map(def => {
          console.log(`${instrumentName} loading`)
          const sampler = this.soundfont.getToneSampler(def)
          this.instruments.push({name: instrumentName, sampler});
          return sampler;
        })
      )
    }
  }
  
  loadPreview(midiFile: any, options?: any): Observable<any> {
    Tone.Transport.cancel(0);
    this.playerStatus('loading');
    var buffer = midiFile.toArrayBuffer(); // MIDI file dumped as a string
    const midi = new Midi(buffer)
    const loadedTracks: any[] = []
    midi.tracks.forEach(track => {
      // get orload instrument
      const instrumentId = track.instrument.number;
      loadedTracks.push(
        this.getOrLoadSampler(this.names![instrumentId]).pipe(
        map(sampler => {
          sampler.connect(this.reverb);
          if(options?.record) {
            sampler.connect(recorder);
          }
          const part = new Tone.Part((time, note) => {
            // console.log(note);
            let pitch = Tone.Frequency(note.midi, "midi").toNote();
            sampler!.triggerAttack(pitch, time, note.velocity);
            sampler!.triggerRelease(pitch, time + Tone.Time(note.duration).valueOf());
            // this.piano.keyDown({ midi: note.midi, time });
            // this.piano.keyUp({ midi: note.midi, time: time + Tone.Time(note.duration).valueOf() });
          }, track.notes);
          return part;
        })
      ).pipe(
        map(part => {
          part.start(0)
        })
      ));
    });
    return forkJoin(loadedTracks);
  }

  playPreview(options?: any): void {
    if (Tone.Transport.state !== 'started') {
      Tone.Transport.seconds = 0;
      if (options?.record) {
        recorder.start();
        Tone.Transport.on('stop', () => {
          recorder.stop().then(
            (recording) => {
              const url = URL.createObjectURL(recording);
              const anchor = document.createElement('a');
              anchor.download = 'recording.webm';
              anchor.href = url;
              anchor.click();
            });
            
        })
      }
      Tone.Transport.start();
      this.playerStatus('playing');
    } else {
      
      Tone.Transport.stop();
      Tone.Transport.seconds = 0;
      this.playerStatus('stopped');
    }
  }
}
