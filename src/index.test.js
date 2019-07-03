import jsonp from 'jsonp'
import subscribe from './'
import MailChimpError from './MailChimpError'

describe('subscribe', () => {
  let email, uID, listName, audienceID
  beforeEach(() => {
    email = 'example@example.org'
    uID = 'abc123'
    listName = 'abc.def'
    audienceID = 'xyz'
  })

  describe('when the listName is invalid', () => {
    test('it throws an error', () => {
      expect(() => {
        subscribe({ email, uID, audienceID, listName: 'https://mylist.us.lists.com' })
      }).toThrowError(/^Invalid value 'https:\/\/mylist\.us\.lists\.com' for 'listName'/)
    })
  })

  describe('when no email is provided', () => {
    test('it throws an error', () => {
      expect(() => {
        subscribe({ uID, audienceID, listName })
      }).toThrowError(`Missing 'email'`)
    })
  })

  describe('when no uID is provided', () => {
    test('it throws an error', () => {
      expect(() => {
        subscribe({ email, audienceID, listName })
      }).toThrowError(`Missing 'uID'`)
    })
  })

  describe('when no audienceID is provided', () => {
    test('it throws an error', () => {
      expect(() => {
        subscribe({ email, uID, listName })
      }).toThrowError(`Missing 'audienceID'`)
    })
  })

  describe('success', () => {
    let data
    beforeEach(() => {
      data = { msg: 'Success', result: 'success' }
      jsonp.mockImplementation((url, options, cb) => {
        cb(null, data)
      })
    })

    test('jsonp is called with the correct arguments', () => {
      email = 'example@example.org'
      const expectedURL = `//${listName}.list-manage.com/subscribe/post-json?u=${uID}&id=${audienceID}&EMAIL=example%40example.org`
      subscribe({ email, uID, audienceID, listName, timeout: 2000 })
      expect(jsonp).toBeCalledWith(expectedURL, { param: 'c', timeout: 2000 }, expect.any(Function))
    })

    test('it resolves with the success message', async () => {
      const result = await subscribe({ email, uID, audienceID, listName })
      expect(result.message).toEqual('Success')
    })
  })

  describe('errors', () => {
    let err, error
    describe('jsonp error', () => {
      beforeEach(async () => {
        err = new Error('jsonp error')
        jsonp.mockImplementation((url, options, cb) => cb(err, {}))
        try {
          await subscribe({ email, uID, audienceID, listName })
        } catch (err) {
          error = err
        }
      })

      test('it rejects with the jsonp error message', () => {
        expect(error.message).toEqual('jsonp error')
      })

      test('the error is not an instance of MailChimpError', () => {
        expect(error).not.toBeInstanceOf(MailChimpError)
      })
    })

    describe('mailchimp errors', () => {
      let data = { result: 'error' }
      beforeEach(async () => {
        data.msg = 'Mailchimp error'
        jsonp.mockImplementation((url, options, cb) => cb(null, data))
        try {
          await subscribe({ email, uID, audienceID, listName })
        } catch (err) {
          error = err
        }
      })

      test('it rejects with the mailchimp error message', () => {
        expect(error.message).toEqual('Mailchimp error')
      })

      test('it rejects with a MailChimpError instance', () => {
        expect(error).toBeInstanceOf(MailChimpError)
      })
    })
  })
})
