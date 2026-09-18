import { Route } from '@angular/router';
import { HomePageComponent } from './features/home/presentation/home.page.component';

export const appRoutes: Route[] = [
    {path: "", loadComponent: () => HomePageComponent}
];
