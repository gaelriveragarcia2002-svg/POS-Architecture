import { Provider } from '@angular/core';
import { InspectionsRepository } from '@pos-architecture/inspections';
import { DrizzleInspectionsRepository } from '../adapters/drizzle-inspections.repository';

export const INSPECTIONS_PROVIDERS: Provider[] = [
    { useClass: DrizzleInspectionsRepository, provide: InspectionsRepository },
];
