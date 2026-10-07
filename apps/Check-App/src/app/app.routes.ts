import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: '',
        loadComponent: () => import('./core/presentation/components/wrapper.component').then((m) => m.WrapperComponent),
        children: [
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
            // Demo de ruta hija de items: compara la transición hijo/padre con la de rutas hermanas.
            {
                path: 'items/detalle',
                loadComponent: () =>
                    import('./features/items/presentation/item-detail.page.component').then(
                        (m) => m.ItemDetailPageComponent,
                    ),
            },
            // Demo para probar ProductsFiltersService en vivo (union/prune + payloadFor).
            {
                path: 'example-1',
                loadComponent: () =>
                    import('./shared/presentation/example-1.page.component').then(
                        (m) => m.Example1PageComponent,
                    ),
            },
            {
                path: 'example-2',
                loadComponent: () =>
                    import('./shared/presentation/example-2.page.component').then(
                        (m) => m.Example2PageComponent,
                    ),
            },
            // Demo de temas: cambia entre los presets de util-theme y su modo claro/oscuro.
            {
                path: 'themes',
                loadComponent: () =>
                    import('./shared/presentation/theme-demo.page.component').then(
                        (m) => m.ThemeDemoPageComponent,
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
        ],
    },
];
