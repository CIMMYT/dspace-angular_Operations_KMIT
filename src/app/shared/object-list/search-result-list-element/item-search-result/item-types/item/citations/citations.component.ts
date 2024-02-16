import { Component, Input } from '@angular/core';

@Component({
  selector: 'citations-badge',
  templateUrl: './citations.component.html',
})

export class CitationsComponent {
  @Input() uniqueDoi: string;
  @Input() type: string;

}