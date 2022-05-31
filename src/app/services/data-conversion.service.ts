import { Injectable } from '@angular/core';
import { CsvData } from '../interfaces/csv-data';
const csv = require('jquery-csv');

@Injectable({
  providedIn: 'root'
})
export class DataConversionService {

  constructor() { }
  
  convertRawInput(input: string, options?: any): any[] {
    return input.trim().split(/[\r?\n|,]/).map(e => {
        if (e === '') { 
          return null;
        } else { 
          return Number(e)
        }
      });
  }

  normalizeData(data: any[], minValue?: number, maxValue?: number): any[] {
    const normalized: any[] = [];
    // get multipliers
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;

    data.forEach(d => {
      if(d) {
        normalized.push((d - min) / range);
      } else {
        normalized.push(null);
      }
    });
    // console.debug(`Normalized Data: ${normalized}`)
    return normalized
  }

  normalizeDataToRange(data: number[], minValue: number, maxValue: number): number[] {
    const converted: number[] = [];
    data = this.normalizeData(data);
    let range = maxValue - minValue;
    // console.debug(data);
    data.forEach(value => {
      // TODO: type checking
      let rangeValue = Math.round(Number(value) * range) + minValue;
      converted.push(rangeValue);
    });
    return converted;
  }

  convertIndexesToNotes(dataIndexes: number[], notesCollection: any[]): any[] {
    const notes: any[] = [];
    dataIndexes.forEach(index => {
      notes.push(notesCollection[index])
    });
    return notes;
  }

  convertNormalizedDataToNotes(data: number[], notesCollection: any[]): any[] {
    const dataIndexes = this.normalizeDataToRange(data, 0, notesCollection.length - 1);
    return this.convertIndexesToNotes(dataIndexes, notesCollection);
  }

  chunk<T>(array: Array<T>, size: number): Array<Array<T>> {
    var originalSize = size;
    var subArray: any[] = []
    var resultArray: any[] = []
    while (array.length > 0) {
      while (size > 0 && array.length > 0) {
        subArray.push(array.shift())
        size--;
      }
      resultArray.push(subArray)
      size = originalSize
      subArray = []
    }
    return resultArray
  }

  parseCsv(csvData: any): any[] {
    const data = csv.toArrays(csvData);
    console.log(data);
    const returnData: CsvData[] = [];
    data.forEach((row: any[], index: number) => {
      row.forEach((column: any, idx) => {
        
        if (index === 0){ // create first entry for each data column.
          if(isNaN(column)) { // if the data type is not numeric, assume it's a header
            returnData.push({name: column, data: []});
          } else {
            returnData.push({ name: `Track ${idx}`, data: [Number(column)] });
          }
        } else {
          if (!column || column === ''){
            returnData[idx].data.push('');
          } else {
            returnData[idx].data.push(Number(column));
          }
        }
      });
    });
    return returnData;
  }

}
