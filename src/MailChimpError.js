import { ERROR_CODES } from './constants'

function getLinks (message) {
  const matches = message.match(/<a href=("|')[^"']+/g)
  return matches
    ? matches.map(match => match.replace(/^.*?("|')([^"']+)/, '$2'))
    : []
}

/**
 * Transforms error message strings from mailchimp into error codes
 */
export default class MailChimpError extends Error {
  /**
   * Get the error code from error code constants
   *
   * @return {Number} Error code
   */
  getCode () {
    const message = this.message.toLowerCase()
    if (message === 'timeout') return ERROR_CODES.TIMEOUT
    if (message.includes('this email address looks fake or invalid')) return ERROR_CODES.INVALID_EMAIL
    if (message.includes('the domain portion of the email address is invalid')) return ERROR_CODES.INVALID_EMAIL_DOMAIN
    if (message.includes('the username portion of the email address is invalid')) return ERROR_CODES.INVALID_EMAIL_USERNAME
    if (message.includes('is already subscribed to list')) return ERROR_CODES.EMAIL_ALREADY_SUBSCRIBED
    if (message.includes('please enter a value')) return ERROR_CODES.VALUE_MISSING
    if (message.includes('has too many recent signup requests')) return ERROR_CODES.TOO_MANY_REQUESTS
    if (message.match(/^0\s-\s/)) return ERROR_CODES.INVALID_EMAIL
    if (message.match(/^1\s-\s/)) return ERROR_CODES.VALUE_MISSING
    return ERROR_CODES.GENERIC
  }

  /**
   * Gets optional context for the error code, by further parsing the error message
   *
   * @return {Object}
   */
  getContext () {
    let context = {}
    const { message } = this
    const code = this.getCode()
    switch (code) {
      case ERROR_CODES.EMAIL_ALREADY_SUBSCRIBED:
        context.manageSubscriptionLink = getLinks(message)[0]
        break
    }

    return context
  }
}
