# Spektune
An application for translating data into MIDI files (and ultimately, into music). The concept was inspired by and developed in collaboration with Ryan Vandermeulen, Satellite Oceanographer at NASA Goddard’s Ocean Ecology Laboratory.

Prototype songs were built from spectrographic data obtained from NASA Earth-observation satellites. A mathematical translation of the spectral variation in the Blue, Green, and Red reflectance is normalized across a set of octaves and musical scale.

We developed a tool to create note data and MIDI files from a column of numbers (normalized or not). Resulting files can be imported into any DAW worth it's salt. In our case, Garage Band (because, at $free it's a bargain at twice the price)

[Try it here!](https://www.spektune.com/)

## How it works

User gerenates a MIDI "track" by supplying data and selecting configuration options for the musical interpreter.

[See the About page for more info](http://localhost:4200/about).

## Development

This is an Angular 13 app using Bootstrap 5. You know what to do.

There is a Dockerfile in here that _does not work_. If you care enough about that, please fix it for me, thx.

## Resources (and thanks)

* [Tonal](https://github.com/tonaljs/tonal) - A music theory library that knows more about music than I ever will. It is instrumental in providing the numerous possibilities for musical expression with this tool.
* [WebAudioFont](https://surikov.github.io/webaudiofont/) - Many thanks to Sergey Surikov for this.
* [ToneJS](https://tonejs.github.io/) - This library makes it possible for you to listen to your compositions in the tool.
* [JZZ Midi](https://github.com/jazz-soft/JZZ) - Used for writing MIDI files.
