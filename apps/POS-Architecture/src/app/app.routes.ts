import { Route } from '@angular/router';
import { GlobalLoginComponent } from '@pos-architecture/auth';

export const appRoutes: Route[] = [
  // La ruta '' debe EXISTIR para que el shell (app.ts) llegue a renderizarse.
  // `children: []` la hace casar sin montar nada en el <router-outlet>.
  // `pathMatch: 'full'` evita que '' actúe como prefijo de todas las URLs.
  {
    path: '',
    pathMatch: 'full',
    children: [],
  },
  {
    path: 'login',
    component: GlobalLoginComponent,
  },
];
