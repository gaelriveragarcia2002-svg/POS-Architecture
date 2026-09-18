import { Route } from '@angular/router';
import { InspectionPageComponent } from './features/inspections/presentation/inspection.page.component';
import { HomePageComponent } from './features/items/presentation/home.page.component';
import { SqliteConsolePageComponent } from './shared/presentation/sqlite-console.page.component';

export const appRoutes: Route[] = [
    { path: '', loadComponent: () => InspectionPageComponent },
    // Demo de items: queda parqueada pero accesible, no se borró.
    { path: 'items', loadComponent: () => HomePageComponent },
    // Debug only — ver el comentario en el componente antes de exponer esto
    // a un usuario real.
    { path: 'db', loadComponent: () => SqliteConsolePageComponent },
];
