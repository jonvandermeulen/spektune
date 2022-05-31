import { Component, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Composition } from '../interfaces';
const examples = require('./examples.json');

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent implements OnInit {
  @Input() exampleId: string = "";
  
  exampleObject: any;
  youtubeUrl?: any;
  description: any
  
  constructor(private sanitizer: DomSanitizer) {
    
  }

  ngOnInit(): void {
    this.exampleObject = examples.find((ex: any) => ex.id === this.exampleId);
    
    this.youtubeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.exampleObject?.youtube || '/');

  }

  ngAfterViewInit(): void {
    
  }

}
