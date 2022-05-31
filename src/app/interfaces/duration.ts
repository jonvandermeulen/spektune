import { tick } from "@angular/core/testing";
const durations: DurationInterface[] = require('../data/duration-dictionary.json');
export interface DurationInterface {
    name?: string,
    tonejs?: string,
    midiwriter?: string,
    ticks: number
}
export class Duration implements DurationInterface {
    name?: string;
    tonejs?: string;
    midiwriter?: string;
    ticks: number;

    constructor(lookupValue?: any) {
        const thisDuration = 
            Duration.fromName(lookupValue) ||
            Duration.fromTonejs(lookupValue) ||
            Duration.fromMidiwriter(lookupValue) ||
            Duration.fromTicks(lookupValue);
        
        this.name = thisDuration?.name;
        this.tonejs = thisDuration?.tonejs;
        this.midiwriter = thisDuration?.midiwriter;
        this.ticks = thisDuration?.ticks || 0;
    }

    // toMidiWriterDuration(): MidiWriter.Duration | MidiWriter.Duration[] | undefined {
    //     const dur = [];
        
    //     // If we already know it
    //     if (this.tonejs){
    //         return this.tonejs;
    //     }

    //     const candidates = durations.map(d => {

    //     })
    //     const sum = function sum(arr: any[]) {
    //         return Number(arr.reduce(function (a, b) {
    //             return a + b;
    //         }, 0));
    //     };

    //     const combinations = function combinations(numArr: any[]): any[] | undefined {
    //         var func = function func(active: any[], rest: any[], results: any[]): any[] | undefined {
    //             if (!active.length && !rest.length) return undefined;

    //             if (!rest.length) {
    //                 results.push(active);
    //             } else {
    //                 var active2 = active.slice();
    //                 active2.push(rest[0]);
    //                 func(active2, rest.slice(1), results);
    //                 func(active, rest.slice(1), results);
    //             }

    //             return results;
    //         };
    //         return func([], numArr, []);
    //     }

    //     const extractCombinations = function extractCombinations(candidates: any[], target: any[]) {
    //         if (candidates.length >= 1 && target.length === 1) {
    //             var combinationArray: any[] = [];
    //             combinations(candidates)?.forEach(function (comb) {
    //                 if (sum(comb) === target[0]) {
    //                     var combStr = '';
    //                     comb.forEach(function (num: number, i: number) {
    //                         if (i === comb.length - 1) {
    //                             combStr += num + ' = ';
    //                         } else {
    //                             combStr += num + ' + ';
    //                         }
    //                     });
    //                     combStr += target[0];
    //                     combinationArray.push(combStr);
    //                 }
    //             });
    //             return combinationArray;
    //         } else {
    //             return [];
    //         }
    //     };
    // }

    static fromName(name: any): Duration | undefined {
        return durations.find(d => d.name === name); 
    }
    static fromTonejs(tonejs: any): Duration | undefined {
        return durations.find(d => d.tonejs === tonejs); 
    }
    static fromMidiwriter(midiwriter: any): Duration | undefined {
        return durations.find(d => d.midiwriter === midiwriter); 
    }
    static fromTicks(ticks: any): Duration {
        return durations.find(d => d.ticks === ticks)
            || {ticks}; 
    }
    static all(): DurationInterface[] {
        return durations;
    }
    static sumTicks(durationList: DurationInterface[]): number {
        let tickSum: number = 0;
        durationList.forEach(d => {
            tickSum += d.ticks;
        });
        return tickSum;
    }

    static sum(durationList: DurationInterface[]): Duration {
        let t = Duration.sumTicks(durationList);
        let d = Duration.fromTicks(t);
        return d!;
    }
}
