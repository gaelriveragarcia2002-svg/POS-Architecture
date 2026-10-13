import { Observable } from 'rxjs';
import { Product, ProductsFilter } from '../product';

export abstract class ProductsRepository {
  abstract list(filter?: ProductsFilter): Observable<Product[]>;
}
