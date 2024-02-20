import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'altmetric-badge',
  templateUrl: './altmetric.component.html',
})

export class AltmetricComponent implements OnInit {
  @Input() uniqueDoi: string;
  @Input() type: string;
  ngOnInit(): void {
  this.loadExternalScript('https://d1bxh8uas1mnw7.cloudfront.net/assets/embed.js');
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