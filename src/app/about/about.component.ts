import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  songs: any[] = [
    { name: 'eddy', url: '/assets/examples/eddy.mp3', status: '' },
    { name: 'queensland', url: '/assets/examples/queensland.mp3', status: '' },
    { name: 'australia', url: '/assets/examples/australia.mp3', status: '' },
    { name: 'rio', url: '/assets/examples/Rio-de-la-Plata.mp3', status: '' },
    { name: 'btc', url: '/assets/examples/btc-20210517-20220517.mp3', status: '' },
  ]


  constructor() { }

  ngOnInit(): void {
  }

  play(name: string) {
    // stop all songs
    this.songs.forEach(song => {
      if (song.name !== name) {
        let s: any = document.getElementById(`play-${song.name}`);
        if(s) {
          s.pause();
          s.currentTime = 0;
          document.getElementById(`icon-${song.name}`)?.classList.remove('fa-pause');
          document.getElementById(`icon-${song.name}`)?.classList.add('fa-play');
        }
        song.status = '';
      }
    });
    let song = this.songs.find(song => song.name === name);
    let s: any = document.getElementById(`play-${song.name}`);
    if (song.status === 'playing' ){
      s.pause();
      s.currentTime = 0;
      document.getElementById(`icon-${song.name}`)?.classList.remove('fa-pause');
      document.getElementById(`icon-${song.name}`)?.classList.add('fa-play');
      song.status = '';
    } else {
      s?.play();
      document.getElementById(`icon-${song.name}`)?.classList.remove('fa-play');
      document.getElementById(`icon-${song.name}`)?.classList.add('fa-pause');
      song.status = 'playing';
    }
    

  }

}
