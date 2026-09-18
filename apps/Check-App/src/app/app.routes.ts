import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./features/inspections/presentation/inspection.page.component').then(
                (m) => m.InspectionPageComponent,
            ),
    },
    // Demo de items: queda parqueada pero accesible, no se borró.
    {
        path: 'items',
        loadComponent: () =>
            import('./features/items/presentation/home.page.component').then(
                (m) => m.HomePageComponent,
            ),
    },
    // Debug only — pesa lo que pesa AG Grid, por eso va lazy de verdad, en su
    // propio chunk, nunca dentro del bundle principal que descarga cualquier
    // usuario real. Ver el comentario en el componente antes de exponer esto
    // a un usuario real.
    {
        path: 'db',
        loadComponent: () =>
            import('./shared/presentation/sqlite-console.page.component').then(
                (m) => m.SqliteConsolePageComponent,
            ),
    },
];
