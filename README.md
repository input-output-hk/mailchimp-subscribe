<h1 align="center">
  Mailchimp subscribe library
</h1>

<p align="center">
  An internationalization friendly mailchimp subscribe library. Subscribe emails to your mailing lists.
</p>

<p align="center">
  <a href="https://github.com/input-output-hk/mailchimp-subscribe/issues" title="Mailchimp Subscribe issues">
    <img src="https://img.shields.io/github/issues/input-output-hk/mailchimp-subscribe.svg" alt="Mailchimp Subscribe issues" />
  </a>
  <img src="https://img.shields.io/github/forks/input-output-hk/mailchimp-subscribe.svg" alt="Fork Mailchimp Subscribe" />
  <img src="https://img.shields.io/github/stars/input-output-hk/mailchimp-subscribe.svg" alt="Mailchimp Subscribe stars" />
  <a href="https://github.com/input-output-hk/mailchimp-subscribe/blob/master/LICENSE.md" title="Mailchimp Subscribe license">
    <img src="https://img.shields.io/github/license/input-output-hk/mailchimp-subscribe.svg" alt="Mailchimp Subscribe license" />
  </a>
  <img src="https://img.shields.io/circleci/build/github/input-output-hk/mailchimp-subscribe.svg" alt="CircleCI build">
  <img src="https://coveralls.io/repos/github/input-output-hk/mailchimp-subscribe/badge.svg?branch=master" alt="Test coverage" />
</p>
<br />

## Contents

1. [Features](#features)
1. [Install](#install)
1. [Finding mailchimp values](#finding-mailchimp-values)
1. [Examples](#examples)
1. [Contributing](#contributing)

## Features

* Error codes and success codes for i18n
* Custom fields

## Install

```
npm install --save @input-output-hk/mailchimp-subscribe
```

or

```
yarn add @input-output-hk/mailchimp-subscribe
```

## Finding Mailchimp values

### Finding the 'uID' value

<img alt="Mailchimp audience sign up forms instructions" src="https://github.com/input-output-hk/mailchimp-subscribe/blob/master/instructions/audience-signup-forms.jpg" width="800" />

<img alt="Mailchimp audience embedded forms instructions" src="https://github.com/input-output-hk/mailchimp-subscribe/blob/master/instructions/embedded-forms.jpg" width="800" />

<img alt="Mailchimp audience embedded forms uid instructions" src="https://github.com/input-output-hk/mailchimp-subscribe/blob/master/instructions/uid.jpg" width="800" />

### Finding the 'audienceID' value

<img alt="Mailchimp audience sign up forms instructions" src="https://github.com/input-output-hk/mailchimp-subscribe/blob/master/instructions/audience-signup-forms.jpg" width="800" />

<img alt="Mailchimp audience name and defaults" src="https://github.com/input-output-hk/mailchimp-subscribe/blob/master/instructions/audience-name-and-defaults.jpg" width="800" />

<img alt="Mailchimp audience id instructions" src="https://github.com/input-output-hk/mailchimp-subscribe/blob/master/instructions/audience-id-instructions.jpg" width="800" />

### Finding the 'listName' value

<img alt="Mailchimp audience sign up forms instructions" src="https://github.com/input-output-hk/mailchimp-subscribe/blob/master/instructions/audience-signup-forms.jpg" width="800" />

<img alt="Mailchimp audience embedded forms instructions" src="https://github.com/input-output-hk/mailchimp-subscribe/blob/master/instructions/embedded-forms.jpg" width="800" />

<img alt="Mailchimp audience embedded forms uid instructions" src="https://github.com/input-output-hk/mailchimp-subscribe/blob/master/instructions/list-name.jpg" width="800" />

## Examples

### Basic supporting localization

```
import subscribe, { SUCCESS_CODES, ERROR_CODES } from '@input-output-hk/mailchimp-subscribe'

async function submitForm (email) {
  try {
    const result = await subscribe({
      email,
      uID: 'XXXXXXXXX',
      audienceID: 'XXXXXXXXX',
      listName: 'XXXXXX.XXXX'
    })

    const successCode = result.getCode()
    switch (successCode) {
      case SUCCESS_CODES.CONFIRM_EMAIL_ADDRESS:
        // Successfully subscribed, user needs to confirm email
        return '' // Use the code to return a localized string message
      case SUCCESS_CODES.GENERIC:
        // Successfully subscribed, default code
        return '' // Use the code to return a localized string message
    }
  } catch (error) {
    // Original message returned from mailchimp
    const message = error.message
    const errorCode = error.getCode()

    switch (successCode) {
      case ERROR_CODES.INVALID_EMAIL:
        // Email invalid
        return '' // Use the code to return a localized string message

      case ERROR_CODES.INVALID_EMAIL_DOMAIN:
        // Domain section of email invalid
        return '' // Use the code to return a localized string message

      case ERROR_CODES.INVALID_EMAIL_USERNAME:
        // Username section of email invalid
        return '' // Use the code to return a localized string message

      case ERROR_CODES.EMAIL_ALREADY_SUBSCRIBED:
        // Email is already subscribed to mailing list
        // Additional context is available here
        // Link to manage the subscription for the email address
        const manageSubscriptionLink = error.getContext().manageSubscriptionLink
        return '' // Use the code to return a localized string message

      case ERROR_CODES.TIMEOUT:
        // Request timed out
        return '' // Use the code to return a localized string message

      case ERROR_CODES.GENERIC:
        // Generic error code, server errors etc.
        return '' // Use the code to return a localized string message
    }
  }
}

```

### Basic without localization

```
import subscribe from '@input-output-hk/mailchimp-subscribe'

async function submitForm (email) {
  try {
    await subscribe({
      email,
      uID: 'XXXXXXXXX',
      audienceID: 'XXXXXXXXX',
      listName: 'XXXXXX.XXXX'
    })

    return true
  } catch (error) {
    // handle error
    // error.message is the message returned from Mailchimp if the error originated on mailchimp
    return false
  }
}

```

### Custom fields

```
import subscribe from '@input-output-hk/mailchimp-subscribe'

async function submitForm (email) {
  try {
    await subscribe({
      email,
      uID: 'XXXXXXXXX',
      audienceID: 'XXXXXXXXX',
      listName: 'XXXXXX.XXXX',
      customFields: {
        MY_FIELD: 'value',
        MY_SECOND_FIELD: 'value_2'
      }
    })

    return true
  } catch (error) {
    // handle error
    // error.message is the message returned from Mailchimp if the error originated on mailchimp
    return false
  }
}

```

### Specifiying a timeout

```
import subscribe from '@input-output-hk/mailchimp-subscribe'

async function submitForm (email) {
  try {
    await subscribe({
      email,
      uID: 'XXXXXXXXX',
      audienceID: 'XXXXXXXXX',
      listName: 'XXXXXX.XXXX',
      // 6000ms
      timeout: 6000
    })

    return true
  } catch (error) {
    // handle error
    // error.message is the message returned from Mailchimp if the error originated on mailchimp
    return false
  }
}

```

## Contributing

Contributions are welcome, see [contributing](https://github.com/input-output-hk/mailchimp-subscribe/tree/master/docs/contributing.md) for more info.
