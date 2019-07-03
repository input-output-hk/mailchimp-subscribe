import jsonp from 'jsonp'
import subscribe, { ERROR_CODES, SUCCESS_CODES } from './'

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

    describe('generic success', () => {
      beforeEach(() => {
        data = { msg: 'Success', result: 'success' }
      })

      test('it resolves with the GENERIC success code', async () => {
        const result = await subscribe({ email, uID, audienceID, listName })
        expect(result.getCode()).toEqual(SUCCESS_CODES.GENERIC)
      })
    })

    describe('when a user needs to confirm their email address', () => {
      beforeEach(() => {
        data = {
          msg: 'Almost finished... We need to confirm your email address. To complete the subscription process, please click the link in the email we just sent you.',
          result: 'success'
        }
      })

      test('it resolves with the CONFIRM_EMAIL_ADDRESS success code', async () => {
        const result = await subscribe({ email, uID, audienceID, listName })
        expect(result.getCode()).toEqual(SUCCESS_CODES.CONFIRM_EMAIL_ADDRESS)
      })
    })
  })

  describe('errors', () => {
    let error = {}

    async function assignError () {
      try {
        await subscribe({ email, uID, audienceID, listName })
      } catch (err) {
        error = err
      }
    }

    describe('jsonp error', () => {
      let err
      beforeEach(() => {
        jsonp.mockImplementation((url, options, cb) => {
          cb(err, {})
        })
      })

      describe('generic errors', () => {
        beforeEach(async () => {
          err = new Error('Generic error')
          await assignError()
        })

        test('it rejects with the GENERIC error code', () => {
          expect(error.getCode()).toEqual(ERROR_CODES.GENERIC)
        })
      })

      describe('timeout errors', () => {
        beforeEach(async () => {
          err = new Error('Timeout')
          await assignError()
        })

        test('it rejects with the TIMEOUT error code', () => {
          expect(error.getCode()).toEqual(ERROR_CODES.TIMEOUT)
        })
      })
    })

    describe('mailchimp errors', () => {
      let data = { result: 'error' }
      beforeEach(() => {
        jsonp.mockImplementation((url, options, cb) => {
          cb(null, data)
        })
      })

      describe('generic error', () => {
        beforeEach(async () => {
          data.msg = 'borked'
          await assignError()
        })

        test('it rejects with the GENERIC error code', () => {
          expect(error.getCode()).toEqual(ERROR_CODES.GENERIC)
        })
      })

      describe('invalid emails', () => {
        beforeEach(async () => {
          data.msg = '0 - This email address looks fake or invalid. Please enter a real email address.'
          await assignError()
        })

        test('it rejects with the INVALID_EMAIL error code', () => {
          expect(error.getCode()).toEqual(ERROR_CODES.INVALID_EMAIL)
        })
      })

      describe('messages beginning with `0 - `', () => {
        beforeEach(async () => {
          data.msg = '0 - Some error'
          await assignError()
        })

        test('it rejects with the INVALID_EMAIL error code', () => {
          expect(error.getCode()).toEqual(ERROR_CODES.INVALID_EMAIL)
        })
      })

      describe('invalid email domain', () => {
        beforeEach(async () => {
          data.msg = '0 - The domain portion of the email address is invalid (the portion after the @: example)'
          await assignError()
        })

        test('it rejects with the INVALID_EMAIL_DOMAIN error code', () => {
          expect(error.getCode()).toEqual(ERROR_CODES.INVALID_EMAIL_DOMAIN)
        })
      })

      describe('invalid email username', () => {
        beforeEach(async () => {
          data.msg = '0 - The username portion of the email address is invalid (the portion before the @: .)'
          await assignError()
        })

        test('it rejects with the INVALID_EMAIL_USERNAME error code', () => {
          expect(error.getCode()).toEqual(ERROR_CODES.INVALID_EMAIL_USERNAME)
        })
      })

      describe('email already subscribed', () => {
        beforeEach(async () => {
          data.msg = 'example@example.org is already subscribed to list abc.def. <a href="https://abc.def.list-manage.com/subscribe/send-email?e=abcdefg">Click here to update your profile</a>'
          await assignError()
        })

        test('it rejects with the EMAIL_ALREADY_SUBSCRIBED error code', () => {
          expect(error.getCode()).toEqual(ERROR_CODES.EMAIL_ALREADY_SUBSCRIBED)
        })

        test('it returns the manage link in context', () => {
          expect(error.getContext()).toEqual({
            manageSubscriptionLink: 'https://abc.def.list-manage.com/subscribe/send-email?e=abcdefg'
          })
        })
      })

      describe('too many requests', () => {
        beforeEach(async () => {
          data.msg = 'Recipient "example@example.org" has too many recent signup requests'
          await assignError()
        })

        test('it rejects with the TOO_MANY_REQUESTS error code', () => {
          expect(error.getCode()).toEqual(ERROR_CODES.TOO_MANY_REQUESTS)
        })
      })

      describe('value missing', () => {
        beforeEach(async () => {
          data.msg = '1 - Please enter a value'
          await assignError()
        })

        test('it rejects with the VALUE_MISSING error code', () => {
          expect(error.getCode()).toEqual(ERROR_CODES.VALUE_MISSING)
        })
      })

      describe('messages beginning with `1 - `', () => {
        beforeEach(async () => {
          data.msg = '1 - Some error'
          await assignError()
        })

        test('it rejects with the VALUE_MISSING error code', () => {
          expect(error.getCode()).toEqual(ERROR_CODES.VALUE_MISSING)
        })
      })
    })
  })
})
