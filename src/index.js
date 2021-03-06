import jsonp from 'jsonp'
import MailChimpError from './MailChimpError'
import MailChimpSuccess from './MailChimpSuccess'

const validateFields = ({ email, listName, uID, audienceID }) => {
  if (!listName || listName.match(/\//)) throw new Error(`Invalid value '${listName}' for 'listName', should be the subdomain section of 'list-manage.com'; https://mylist.us.list-manage.com/ -> 'mylist.us'`)
  if (!email) throw new Error(`Missing 'email'`)
  if (!uID) throw new Error(`Missing 'uID'`)
  if (!audienceID) throw new Error(`Missing 'audienceID'`)
}

/**
 * Subscribe an email address to a mailchimp list
 *
 * @param {String} email                          The email address to sign up
 * @param {Object<String>:<String>} customFields  Object pairing of custom fields to pass through to mailchimp
 * @param {String} listName                       Name of the list to subscribe to
 * @param {String} uID                            u value for query string
 * @param {String} audienceID                     Audience ID
 * @param {Number} timeout                        Request timeout value in ms
 *
 * @return {Promise<MailChimpSuccess>}            Or rejects with MailChimpError
 */
export default ({ email, customFields, listName, uID, audienceID, timeout = 3000 }) => {
  validateFields({ email, listName, uID, audienceID })
  const url = `//${listName}.list-manage.com`
  const endpoint = '/subscribe/post-json'
  let parameters = {
    u: uID,
    id: audienceID,
    EMAIL: email,
    ...customFields
  }

  return new Promise((resolve, reject) => {
    const queryString = Object.keys(parameters).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(parameters[key])}`).join('&')
    const fullURL = `${url}${endpoint}?${queryString}`
    jsonp(fullURL, {
      param: 'c',
      timeout
    }, (err, data) => {
      try {
        if (err) throw err
        if (data.result === 'error') throw new MailChimpError(data.msg)
        resolve(new MailChimpSuccess(data.msg))
      } catch (error) {
        reject(error)
      }
    })
  })
}
