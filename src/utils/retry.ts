export interface RetryOptions {
  maxRetries?: number
  initialDelayMs?: number
  backoffFactor?: number
  onError?: (attempt: number, error: unknown) => void
}

const sleep = (duration: number) =>
  new Promise(resolve => {
    setTimeout(resolve, duration)
  })

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  { maxRetries = 3, initialDelayMs = 300, backoffFactor = 2, onError }: RetryOptions = {}
): Promise<T> {
  let attempt = 0
  let delay = initialDelayMs

  while (true) {
    try {
      return await operation()
    } catch (error) {
      if (attempt >= maxRetries) {
        throw error
      }

      onError?.(attempt + 1, error)
      await sleep(delay)
      attempt += 1
      delay *= backoffFactor
    }
  }
}
