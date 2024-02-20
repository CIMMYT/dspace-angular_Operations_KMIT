import { Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'citations-badge',
  templateUrl: './citations.component.html',
})

export class CitationsComponent implements OnInit {
  @Input() uniqueDoi: string;
  @Input() type: string;
  ngOnInit(): void {
  this.loadExternalScript('https://badge.dimensions.ai/badge.js');
  }

  loadExternalScript(scriptUrl: string): void {
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => {
      // El archivo se ha cargado correctamente, puedes ejecutar funciones del script aquí
      // Por ejemplo, si el script define una función llamada "init", puedes llamarla aquí
      // init();
    };
    document.head.appendChild(script);
  }
}