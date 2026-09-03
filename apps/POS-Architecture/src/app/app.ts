import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GlobalLoginComponent } from '@pos-architecture/auth';
import { NxWelcome } from './nx-welcome';

@Component({
  imports: [NxWelcome, RouterModule, GlobalLoginComponent],
  selector: 'app-root',
  template: `
    <!-- <app-nx-welcome></app-nx-welcome> -->
    <h1>Soy una prueba</h1>
    <app-global-login/>
    <router-outlet></router-outlet>
  `,
})
export class App {
  protected title = 'POS-Architecture';
}
