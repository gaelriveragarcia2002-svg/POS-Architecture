import { Observable } from 'rxjs';
import { Inspection, NewInspection } from '../inspection';

export abstract class InspectionsRepository {
  abstract list(): Observable<Inspection[]>;
  abstract save(inspection: NewInspection): Observable<Inspection>;
}
