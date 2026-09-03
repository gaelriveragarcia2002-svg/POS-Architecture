export interface EmptyUseCase<TInput = void> {
  execute(input: TInput): void;
}