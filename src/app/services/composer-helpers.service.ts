import { Injectable } from '@angular/core';
import * as Tonal from '@tonaljs/tonal';
import { ScaleType } from '@tonaljs/scale-type';
import { Duration, DurationInterface, ModulationOption, Note, Track } from '../interfaces';
import { DataConversionService } from './data-conversion.service';
const midiInstrumentList = require('../data/midi-instruments.json');
const midiDrumNotes = require('../data/midi-drums.json');
const durations = require('../data/duration-dictionary.json');
@Injectable({
  providedIn: 'root'
})
export class ComposerHelpersService {

  keyNoteList: string[] = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
  
  constructor(
    private dataService: DataConversionService
  ) { }

  getScales(): ScaleType[] {
    return Tonal.ScaleDictionary.all().sort((a, b) => {
      if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1;
      }
      if (a.name.toLowerCase() > b.name.toLowerCase()) {
        return 1;
      }
      return 0;
    });
  }

  createNotesCollection(notes: string[], startOctave: number, endOctave: number): string[] {
    const allNotes: string[] = [];
    // notes = this.sortNotes(notes);
    const rootNoteIndex = this.keyNoteList.findIndex(n => n === notes[0]);
    if ( startOctave > endOctave ){
      // reverse scale
      let revNotes: string[] = [];
      revNotes = revNotes.concat(notes);
      revNotes.reverse();
      for (let i: number = startOctave; i >= endOctave; i--) {
        revNotes.forEach((note, index) => {
          const thisNoteIndex = this.keyNoteList.findIndex(n => n === note);
          // for descending sequences like "G, E, D, C, A" (Am5), C is where the octave changes. 
          // The order should be: "G3, E3, D3, C3, A2"
          if (thisNoteIndex < rootNoteIndex) {
            allNotes.push(`${note}${i}`);
          } else {
            allNotes.push(`${note}${(Number(i) - Number(1))}`);
          }
        });
      }
    } else {
      for (let i: number = startOctave; i <= endOctave; i++) {
        notes.forEach((note, index) => {
          const thisNoteIndex = this.keyNoteList.findIndex(n => n === note);
          // for ascending sequences like "A, C, D, E, G" (Am5), C is where the octave changes. 
          // The order should be: "A2, C3, D3, E3, G3"
          if (thisNoteIndex < rootNoteIndex) {
            allNotes.push(`${note}${(Number(i) + Number(1))}`);
          } else {
            allNotes.push(`${note}${i}`);
          }
        });
      }
    }
    return allNotes;
  }

  // Sorts notes starting from C. For making sure our octaves are correct.
  sortNotes(scale: string[]): string[] {
    const notes: string[] = [];
    this.keyNoteList.forEach(keyNote => {
      if(scale.find(v => v === keyNote)) {
        notes.push(keyNote);
      }
    })
    return notes;
  }

  allNotes(): any[] {
    const all: any[] = [];
    for (let i = -1; i <= 8; i++) {
      this.keyNoteList.forEach((note, index) => {
        all.push({
          note: note,
          octave: i,
          noteOctave: `${note}${i}`
        });
      });
    }
    return all;
  }

  createNotesFromData(data: any[], notesCollection: any[], duration: Duration, options?: any): Note[] {
    // map each data point to a note based on the normalized values and note collection
    const notes: Note[] = [];
    const range = notesCollection.length - 1;
    console.log('createNotesFromData options')
    console.log(options)
    let vData: any[];
    if (options?.modulationOptions?.find((m: any) => m.type === 'velocity')){
      console.log('found velocity')
      let velocityMod = options.modulationOptions.find((m: any) => m.type === 'velocity')!;
      let data = this.dataService.convertRawInput(velocityMod.data)
      vData = this.dataService.normalizeDataToRange(data, velocityMod.minValue, velocityMod.maxValue);
      console.log(vData);
    }
    let restNotes: string[];
    console.log(`rest notes: ${options?.restNotes}`);
    if(options?.restNotes){
      restNotes = options.restNotes.split(',');
    }
    data.forEach((value, idx) => {
      if(value !== undefined && value !== '') {  
        const index = Math.round(value * range);

        let velocity = ( vData && vData[idx] ) ? vData[idx] : options?.defaultVelocity || 70; // modulated velocity or default

        if (restNotes?.find((r: string) => r === notesCollection[index])) {
          console.log('rest!');
          velocity = 0;
        } else {
          notes.push({
            pitch: [notesCollection[index]], // as an array of notes in case we ever decide to stack them into chords
            duration: [duration], // as an array so repeat notes may be merged later
            normalizedData: [value],
            noteIndex: index,
            velocity: velocity,
            rawData: (options?.rawData) ? [options.rawData[idx]] : null,
          });
        }
      } else {
        notes.push({
          pitch: [], // as an array of notes in case we ever decide to stack them into chords
          duration: [duration], // as an array so repeat notes may be merged later
          normalizedData: [value],
          noteIndex: -1,
          velocity: 0,
          rawData: (options?.rawData) ? [options.rawData[idx]] : null,
        });
      }
    });
    return notes;
  }

  createCSVFromNotes(notes: Note[], options?: any) {
    let output: string[]= [];
    output.push('raw_data,normalized_data,pitch_name,pitch_midi,note_on');
    notes.forEach(note => {
      note.duration.forEach((d, idx) => {
        output.push(
          `${note.rawData[idx]},${note.normalizedData[idx]},"${note.pitch[0]}",${Tonal.Midi.toMidi(note.pitch[0])},${(idx > 0) ? '0' : '1'}`
        ); 
      });
    });
    return output.join('\n');
  }

  /**
   * Merges consecutive duplicate notes into one longer note.
   * eg: C3, C3, C3 (quarter notes) -> C3 (dotted half)
  */
  mergeNotes(notes: Array<Note>, options?: any): Array<Note> {
    const outNotes: Array<Note> = [];
    let lastNote: Note;
    console.log('options:');
    console.log(options);

    notes.forEach(thisNote => {
      // If the current note pitch is the same as the last one, combine them into one note with a longer duration
      if (lastNote && lastNote.pitch![0] == thisNote.pitch![0]) {

        // Only merge notes if the lastNote duration does not meet/exceed the mergeLimit
        // If the mergeLimit is 0, then duplicate notes will be merged indefinitely.
        if (options?.mergeLimit == 0 || lastNote.duration.length < options?.mergeLimit) {
          // console.debug(`Duration Update`);
          thisNote.rawData = lastNote.rawData.concat(thisNote.rawData);
          thisNote.normalizedData = lastNote.normalizedData.concat(thisNote.normalizedData);
          thisNote.duration = lastNote.duration.concat(thisNote.duration);
          thisNote.velocity = Math.round((lastNote.velocity + thisNote.velocity)/2);
          outNotes.pop(); // delete the old one          
        }
      }
      outNotes.push(thisNote);
      // console.debug(`lastNote: ${JSON.stringify(lastNote)}`)
      // console.debug(`newNote: ${JSON.stringify(newNote)}`)
      lastNote = thisNote;
    });

    // if there's an offset, add a "wait" to the first note.
    return outNotes;
  }

  mergeTracks(tracks: Array<Track>, options?: any): any {
    
  }

  // createDrumPhrase(notes: Array<NoteData>, options: any){
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
     * !!! BINARY HASHING! 8-note drum pattern -> 8 bit number.
     * Hashing method: XOR?
     * 35 = 00100011
     * 46 = 00101110
     * rs = 00001101 - results are often very low?
     * 
     * AND
     * 35 = 00100011
     * 46 = 00101110
     * rs = 11110010 (242) - low numbers result in beats heavy in first part of the measure
     * 
     * 
     * C3 60 00111100
     * C4 72 01001000
     *       --------
     * XOR   01110100   
     * AND   10001011  - Good mix of both
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
     * For best results, drum tracks should use a wider or higher octave range? 64-127 
     * 
     * - OR - (this next one requires a lot of work)
     * 
     * Use entire normalized data set from all tracks...
     * 

    */
  // }

  midiInstrumentDictionary(): any[] {
    return midiInstrumentList;
  }

  drumNoteDictionary(): any[] {
    return midiDrumNotes;
  }

  durationDictionary(): DurationInterface[] {
    return Duration.all();
  }


}
