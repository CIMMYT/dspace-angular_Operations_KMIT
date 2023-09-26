import { Component, Input } from '@angular/core';

@Component({
  selector: 'altmetric-badge',
  templateUrl: './altmetric.component.html',
  styleUrls: ['./altmetric.component.css']
})

export class AltmetricComponent {
  @Input() uniqueDoi: string;
  @Input() type: string;

}