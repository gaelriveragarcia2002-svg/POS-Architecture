import { Observable } from "rxjs";
export interface UseCase<TInput = void, TOutput = void> {
  execute(input: TInput): Observable<TOutput>;
}
