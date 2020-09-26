export * from './number'
export * from './time'
export * from './blockchain'

interface MapFns<T, E, TResult, EResult> {
  success: (a: T) => TResult
  failure: (e: E) => EResult
}

export class Result<TSuccess, TError> {
  public static Ok<T>(success: T) {
    return new Result<T, any>(success, null, false)
  }

  public static Err<T>(error: T) {
    return new Result<any, T>(null, error, true)
  }

  public static When = <T, E, TResult, TError>(mapFns: MapFns<T, E, TResult, TError>) => (result: Result<T, E>) => {
    return result.when(mapFns)
  }

  constructor(private success: TSuccess, private error: TError, public isError: boolean) {}

  public when<T, E>(mapFns: MapFns<TSuccess, TError, T, E>) {
    return this.isError ? mapFns.failure(this.error) : mapFns.success(this.success)
  }

  public unwrap() {
    if (this.error) {
      throw new Error('Should not have errored! Handle your unwrap for error.')
    }
    return this.success
  }
}
