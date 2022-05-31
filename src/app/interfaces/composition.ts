import { Track } from './track'

export type SoundFontType = 'FatBoy' | 'FluidR3_GM' | 'MusyngKite'
export interface Composition {
    name: string,
    tempo?: number,
    keyNote?: string,
    keyScale?: string,
    tracks: Track[],
    soundfont?: SoundFontType;
}
