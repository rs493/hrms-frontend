import { ApiError } from '../types/api'

export function getErrorMessage(error, fallback = 'Something went wrong.') {
  if (error instanceof ApiError) {
    if (error.errors.length > 0) {
      return error.errors.join(' ')
    }
    return error.message || fallback
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}

export function getFieldErrors(error) {
  if (error instanceof ApiError) {
    return error.errors
  }
  return []
}
