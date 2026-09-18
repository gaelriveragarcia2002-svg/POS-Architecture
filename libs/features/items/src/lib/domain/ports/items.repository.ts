import { Observable } from 'rxjs';
import { Item, NewItem } from '../item';

export abstract class ItemsRepository {
  abstract list(): Observable<Item[]>;
  abstract add(item: NewItem): Observable<Item>;
}
