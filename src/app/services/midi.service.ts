import { isNull, not } from '@angular/compiler/src/output/output_ast';
import { Injectable, ɵclearResolutionOfComponentResourcesQueue } from '@angular/core';
const JZZ = require('jzz');
require('jzz-midi-smf')(JZZ);
// require('jzz-midi-gm')(JZZ);
import * as Tonal from '@tonaljs/tonal';
import { MonoSynth } from 'tone';
import { Duration, DurationInterface, Note, Track, ModulationOption } from '../interfaces';
import { DataConversionService } from './data-conversion.service';
const midiInstrumentList = require('../data/midi-instruments.json');
const midiDrumNotes = require('../data/midi-drums.json');
const durations = require('../data/duration-dictionary.json');



@Injectable({
  providedIn: 'root'
})
export class MidiService {

  keyNoteList: string[] = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

  constructor(
    private dataService: DataConversionService
  ) { }

  createDrumTrack() {

  }

  createMidiTrack(notes: Note[], options?: any): any {
    console.log(notes);
    var smf = new JZZ.MIDI.SMF(1, 96);
    var track = new JZZ.MIDI.SMF.MTrk();
    smf.push(track);
    const c = options?.channel || 0;
    if (options?.tempo && options.tempo > 0) {
      track.smfBPM(options.tempo);
    }
    if (options?.midiInstrumentId) {
      track.ch(c).program(options.midiInstrumentId - 1); // zero-based index.
    }
    if (options?.name) {
      track.ch(c).smfSeqName(options.name);
    }

    if (options?.volume) {
      track.volumeF(options?.volume / 100);
    }

    let tickCounter: number = 0;

    if (options?.sustain) {
      track.tick(tickCounter).damper(c, 127)
    }

    if (options?.offset) {
      tickCounter += Number(options?.offset) || 0;
    }

    // let velocityMod: ModulationOption;

    if (options?.modulationOptions && options?.modulationOptions.length > 0) {

      options.modulationOptions.forEach((mod: ModulationOption) => {
        // normalize data
        let data = this.dataService.convertRawInput(mod.data)
        const nData = this.dataService.normalizeDataToRange(data, mod.minValue, mod.maxValue);
        /*
        c - channel, nn - note, vv - velocity
        aftertouch(c, nn, xx) - aftertouch; returns Ac nn xx 
        pressure(c, xx) - pressure (channel aftertouch); returns Dc xx. 
        breathF(c, xx) - breath controller  0 <= xx <= 1 
        footF(c, xx) - foot controller 0 <= xx <= 1
        volumeF(c, xx)
        balance(c, xx)
        expressionF(c, xx)
        portamentoTimeF(c, xx)
        portamento(c, b) - portamento on/off; default: b = true;
        sostenuto(c, b) - sostenuto pedal on/off; default: b = true;
        soft(c, b) - soft pedal on/off; default: b = true; returns Bc 43 7f/00.
        legato(c, b) - legato on/off; default: b = true; returns Bc 44 7f/00.
        damper(c, b) - damper pedal on/off; default: b = true *SUSTAIN
        hold2(c, b) - hold 2 on/off; default: b = true; returns Bc 45 7f/00.  The Hold Pedal CC69 is an alternative control message to Sustain that controls how notes are held and fade out. Values of 0-63 indicate OFF. Values 26-127 indicate ON.
        */
        let modCounter = tickCounter
        let cc: any;
        let lastValue: number;
        switch (mod.type) {
          case "sustain":
            //damper(c, b) - damper pedal on/off; default: b = true *SUSTAIN
            // track.tick(modCounter).damper(c, mod.value)
            // TODO: I feel like if the signal is "off", it should wait until the end of the note? Or maybe halfway
            break;
          case "modulation":
            // modF(c, xx) - modulation wheel; converts the floating point number 0 <= xx <= 1 to a 14 - bit value. 
            lastValue = nData[0];
            nData.forEach(value => {
              // This function will ramp up (or down) the control change
              this.ramp(lastValue, value, mod.duration.ticks, 3, (val: number, time: number, step: number) => {
                track.tick(modCounter + time).modF(c, val / 127);
              });
              modCounter += mod.duration.ticks; // || Duration.sum(note.duration!).ticks;
              lastValue = value;
            });
            break;
          case "aftertouch":
            // aftertouch(c, nn, xx) - aftertouch; 0-127 - This applies only to individual notes
            // pressure(c, xx) - pressure (channel aftertouch)
            lastValue = nData[0];
            nData.forEach(value => {
              // This function will ramp up (or down) the control change
              this.ramp(lastValue, value, mod.duration.ticks, 3, (val: number, time: number, step: number) => {
                track.tick(modCounter + time).pressure(c, val);
              });
              modCounter += mod.duration.ticks; // || Duration.sum(note.duration!).ticks;
              lastValue = value;
            });
            break;
          case "expression":
            // aftertouch(c, nn, xx) - aftertouch; 0-127 - This applies only to individual notes
            // pressure(c, xx) - pressure (channel aftertouch)
            lastValue = nData[0];
            nData.forEach(value => {
              // This function will ramp up (or down) the control change
              this.ramp(lastValue, value, mod.duration.ticks, 3, (val: number, time: number, step: number) => {
                track.tick(modCounter + time).expressionF(c, val / 127);
              });
              modCounter += mod.duration.ticks; // || Duration.sum(note.duration!).ticks;
              lastValue = value;
            });
            break;
          case "portamento":
            // portamento(c, b) - portamento on / off; default: b = true;
            // boolean value needs to be translated from 0-127 -> true / false;
            // This one requires some special handling - it needs to be on/off *before* the note. 
            break;
          case "sostenuto":
            // sostenuto(c, b) - sostenuto pedal on/off; default: b = true;
            break;
          case "cutoff":
            // control(c, xx, yy) - other control; returns Bc xx yy;
            cc = 71; // cutoff MIDI
            lastValue = nData[0];
            nData.forEach(value => {
              // This function will ramp up (or down) the control change
              this.ramp(lastValue, value, mod.duration.ticks, 3, (val: number, time: number, step: number) => {
                track.tick(modCounter + time).control(c, cc, val);
              });
              modCounter += mod.duration.ticks; // || Duration.sum(note.duration!).ticks;
              lastValue = value;
            });
            break;
          case "resonance":
            // control(c, xx, yy) - other control; returns Bc xx yy;
            cc = 74; // resonance MIDI
            lastValue = nData[0];
            nData.forEach(value => {
              // This function will ramp up (or down) the control change
              this.ramp(lastValue, value, mod.duration.ticks, 3, (val: number, time: number, step: number) => {
                track.tick(modCounter + time).control(c, cc, val);
              });
              modCounter += mod.duration.ticks; // || Duration.sum(note.duration!).ticks;
              lastValue = value;
            });
            break;
          case "release":
            // control(c, xx, yy) - other control; returns Bc xx yy;
            cc = 72; // release MIDi
            lastValue = nData[0];
            nData.forEach(value => {
              // This function will ramp up (or down) the control change
              this.ramp(lastValue, value, mod.duration.ticks, 2, (val: number, time: number, step: number) => {
                track.tick(modCounter + time).control(c, cc, val);
              });
              modCounter += mod.duration.ticks; // || Duration.sum(note.duration!).ticks;
              lastValue = value;
            });
            break;
          case "attack":
            // control(c, xx, yy) - other control; returns Bc xx yy;
            cc = 73; // attack MIDI
            lastValue = nData[0];
            nData.forEach(value => {
              // This function will ramp up (or down) the control change
              this.ramp(lastValue, value, mod.duration.ticks, 3, (val: number, time: number, step: number) => {
                track.tick(modCounter + time).control(c, cc, val);
              });
              modCounter += mod.duration.ticks; // || Duration.sum(note.duration!).ticks;
              lastValue = value;
            });
            break;

          default:
            break;
        }
        modCounter += mod.duration.ticks || 0;
      });

    }

    notes.forEach((note, index) => {
      let onTick: number = tickCounter; // Note on tick
      let offTick: number = tickCounter + Duration.sumTicks(note.duration!); // Note on tick

      note.pitch!.forEach(pitch => { // Handles simultaneous notes (not implemented yet).
        if (options?.restNotes && options!.restNotes.find(pitch)) {
          // This is a "rest note" that we will not play.
          // do nothing for now, but leave this condition here to handle modulation options in the future.
        } else {
          track.tick(onTick).noteOn(c, Tonal.Midi.toMidi(pitch), note.velocity);
          track.tick(offTick).noteOff(c, Tonal.Midi.toMidi(pitch));
        }
      });

      tickCounter += Duration.sumTicks(note.duration!)
    });
    track.tick(tickCounter + Duration.fromName('whole')!.ticks).smfEndOfTrack();
    return track;
  }

  createMidiFile(tracks: any[], options?: any): any {
    const smf = new JZZ.MIDI.SMF(1, 96); // type 0; 96 ticks per quarter note
    if (options) {
      var track0 = new JZZ.MIDI.SMF.MTrk();
      smf.push(track0);
      if (options?.tempo) {
        track0.smfBPM(options.tempo);
      }
      if (options?.name) {
        track0.smfSeqName(options.name);
      }
    }

    tracks.forEach(track => {
      smf.push(track);
    })
    return smf;
  }

  /**
   * Ramps up (or down) changes in values.
   * @param origin The value at the start of the ramp
   * @param target The value at the end of the ramp
   * @param duration How long it will take to get from the origin to the target (in ticks, generally)
   * @param steps Number of steps in each ramping; More steps make for smoother transitions
   * @param func An in-line function that executes on each step of the ramp. Inputs must include value, time, step number
   */
  ramp(origin: number, target: number, duration: number, steps: number, func: Function) {
    let range = target - origin;
    let valueStepSize = Math.round(range / steps);
    let durationStepSize = Math.round(duration / steps);
    for (let i = 1; i <= steps; i++) {
      let v = origin + (i * valueStepSize);
      let t = durationStepSize * i;
      func(v, t, i);
    }
  }
  
  mergeTracks(tracks: Array<Track>, options?: any): any { }

  getUri(smf: any): string {
    var str = smf.dump(); // MIDI file dumped as a string
    var b64 = JZZ.lib.toBase64(str); // convert to base-64 string
    var uri = 'data:audio/midi;base64,' + b64; // data URI
    return uri
  }

  // createDrumPhrase(notes: Array<NoteData>, options: any) {
  //   const steps: number = options?.steps || 4;
  //   const quantize: number = options?.quantize || 4;
  //   // get groups of notes
  //   const noteGroups = this.dataService.chunk(notes, steps);
  //   noteGroups.forEach((group: any) => {
  //     let bin = 0x0;
  //     group.forEach((note: any) => {
  //       let pitch = note.pitch!.toString();
  //       let midi = Tonal.Note.midi(pitch);
  //       bin = bin ^ midi!; // XOR of binary values 
  //     });
  //     let phrase = ("00000000" + bin.toString(2)).slice(-8) // binary string eg: 00100101


  //   });

  /** Idea: Use all notes in measure to create a unique rhythmic drum phrase. 
   * Example: C4,D4,E4,F4 ->
   * Beat:        1 * 2 * 3 * 4 *
   * Kick:        x - - x - - x -
   * Snare:       - - - - x - - -
   * HH closed:   - x x x - x - -
   * HH open:     - - - - - - x -
   * 
   * Assign each Key Note value to an instrument (kick, snare, etc)?
   * Use the octave to determine the pattern? 
   * !!! BINARY HASHING! 8-note drum pattern -> 8 bit number.
   * Hashing method: XOR?
   * 35 = 00100011
   * 46 = 00101110
   * rs = 00001101 - results are often very low?
   * 
   * AND
   * 35 = 00100011
   * 46 = 00101110
   * rs = 11110010 (242)
   * 
   * 
   * C3 60 00111100
   * C4 72 01001000
   *       --------
   * XOR   01110100   
   * AND   10001011  
   * OR    01111100
   * 
   * 
   * OR
   * 35 = 00100011
   * 46 = 00101110
   * rs = 00101111
   * 
   * Quantize limits bits
   * 8n quant = 0-255 BINARY
   * 4n quant = 0-16 
   * 8-bit is too large. MIDI note values are 7-bit (0-127)
   * Additional bit will need to be calculated. Maybe if value % 4 == 0? (meaning the last 2 are blank)
   * 
   * Reverse the binary digits when mapping - higher number 
   * 
   * 12 = 1100
   * 9  = 1001
   * 
   * For best results, drum tracks should use a wide octave range?
   * 
   * - OR - (this next one requires a lot of work)
   * 
   * Use entire normalized data set from all tracks...
   * 

  */

  // }
}
