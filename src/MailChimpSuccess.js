import { SUCCESS_CODES } from './constants'

/**
 * Transforms success messages into codes
 */
export default class MailChimpSuccess {
  /**
   *
   * @param {String} message The msg from mailchimp
   */
  constructor (message) {
    this.message = message
  }

  /**
   * Gets the success code
   *
   * @return {Number}
   */
  getCode () {
    const message = this.message.toLowerCase()
    if (message.includes('we need to confirm your email address')) return SUCCESS_CODES.CONFIRM_EMAIL_ADDRESS
    return SUCCESS_CODES.GENERIC
  }
}
