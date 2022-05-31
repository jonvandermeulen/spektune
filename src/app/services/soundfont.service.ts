import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Sampler } from 'tone';
import { Tone } from 'tone/build/esm/core/Tone';
import { SoundFontType } from '../interfaces/composition';
import { SamplerDef } from '../interfaces/sampler-def';

@Injectable({
  providedIn: 'root'
})
export class SoundfontService {
  soundfontType: SoundFontType = 'FluidR3_GM'

  constructor(
    private http: HttpClient
  ) { }


  getNames(): Observable<string[]> { 
    return this.http.get<string[]>(`/assets/soundfonts/${this.soundfontType}/names.json`);
  }

  getSamplerDef(name: string): Observable<SamplerDef> {
    return this.http.get<SamplerDef>(`/assets/soundfonts/${this.soundfontType}/${name}.json`);
  }

  getToneSampler(samplerDefinition: SamplerDef): Sampler {
    return new Sampler({
      urls: samplerDefinition.urls,
      baseUrl: samplerDefinition.baseUrl,
    }).toDestination();
  }
}
