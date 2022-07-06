# persona-node-client

`persona-node-client` is a Node/JS and TypeScript Client for
[Persona](https://docs.withpersona.com/) that allows you to use normal Node
syntax to Inquiries, Verifications, Reports, Accounts and other data
from the Persona
[API](https://docs.withpersona.com/reference/inquiries-api).

## Install

```bash
# with npm
$ npm install @flexbase/persona-node-client
```

## Usage

This README isn't going to cover all the specifics of what Persona is,
and how to use it - it's targeted as a _companion_ to the Persona developer
[docs](https://docs.withpersona.com/reference/)
that explain each of the endpoints and how the general Persona
[API](https://docs.withpersona.com/reference/) works.

However, we'll put in plenty of examples so that it's clear how to use this
library to interact with OPersona.

### Getting your API key

This client uses the same API key that you get when you visit the docs about
[obtaining](https://docs.withpersona.com/docs/getting-an-api-key) your API key.
Be it a sandbox key, or a production key, the docs and Persona Dashboard are
pretty clear about how to get your API key.

### Creating the Client

At the current time, a targeted subset of functions are available from the
client. These are currently about the Account and Verification domains, as
well as the detailed Database Verification domain. As we add more features,
this client will exapnd, but for now, this works as we need it to.

The basic construction of the client is:

```typescript
import { Persona } from 'persona-node-client'
const client = new Persona(apiKey)
```

If you'd like to provide the Persona Version to use, or the Key Inflection,
these can also be provided in the constructor:

```typescript
const client = new Persona(apiKey, {
  personaVersion: '2021-07-05',
  keyInflection: 'camel',
})
```

where the options can include:

* `host` - the hostname where all Persona calls should be sent
* `apiKey` - the API Key if you'd like to put it in the options
* `keyInflection` - the casing of the responses: `camel`, `snake`, etc.
* `personaVersion` - the version of Persona's API that you wish to call

### Account Calls

As stated in the Persona
[documentation](https://docs.withpersona.com/reference/accounts-1):

> The account represents a verified individual and contains one or
> more inquiries. The primary use of the account endpoints is to
> fetch previously submitted information for an individual.

#### [List all Accounts](https://docs.withpersona.com/reference/list-all-accounts)

You can get a list of all existing Accounts with a single call:

```typescript
const resp = await client.account.list()
```

where the default is to display the first 10 Accounts for the organization,
and the response will be something like:

```javascript
{
  success: true,
  accounts: [
    {
      type: 'account',
      id: 'act_ivNy2ZA8HHazkkPDZUWDmo2K',
      attributes: [Object]
    },
    {
      type: 'account',
      id: 'act_S62jF245bU8pvPKvv9ALYKHM',
      attributes: [Object]
    },
    {
      type: 'account',
      id: 'act_e9ZNggooRhGywARBeRLo2e4Q',
      attributes: [Object]
    },
    {
      type: 'account',
      id: 'act_2mqkNU3uPecc3vrTf2xDnwkF',
      attributes: [Object]
    },
    {
      type: 'account',
      id: 'act_smwy9CMVW5TzNMH1booyF9W6',
      attributes: [Object]
    },
    ...
  ],
  details: {
    requestId: '48b9dda8-083b-4db7-8fdb-74467748db5f',
    runtime: 0.713731
  }
}
```

where each of the `[Object]` values in `attributes` looks something like:

```javascript
{
  referenceId: '03f1a8f1-75ad-435a-8b9e-05dc77f2f61a',
  createdAt: '2022-06-30T16:25:26.000Z',
  updatedAt: '2022-06-30T16:25:27.000Z',
  nameFirst: 'Tralisha',
  nameMiddle: null,
  nameLast: 'Fenton',
  phoneNumber: '903-991-3776',
  emailAddress: '3hwx94mq@smuggroup.com',
  addressStreet1: '327 Briarbend Rd',
  addressStreet2: null,
  addressCity: 'Goose Creek',
  addressSubdivision: 'South Carolina',
  addressPostalCode: '294457778',
  countryCode: 'US',
  birthdate: '1998-01-11',
  socialSecurityNumber: '111-22-3333',
  tags: [],
  id: 'act_smwy9CMVW5TzNMH1booyF9W6'
}
```

There are several optional parameters to many of the Persona calls,
and they are all included in the call in this format:

```typescript
const resp = await client.account.list({
  size: 20,
})
```

and for this call, the options are:

* `beforeId` - the id of the Account that will be the terminal account
  for the list
* `afterId` - the id of the Account that won't appear on the list, and
  is often the _last_ id from the previous paging fetch of the list.
* `size` - the number of elements to return
* `filterRefId` - the `referenceId` to filter based on that value
  being supplied by the user when the Account was created.

If there had been an error, the response could be something like:

```javascript
{
  "success": false,
  "error": {
    "type": "persona",
    "causes": [
      { "title": "Record not found" },
      ...
    ]
  }
}
```

So looking at the `success` value of the response will quickly let you know the outcome of the call.

#### [Retrieve an Account](https://docs.withpersona.com/reference/apiv1accountsaccount-id-1)

You can pull back an Account that has been previously created with:

```typescript
const resp = await client.account.byId('act_GSzquZ2gyBXsJ9yKB7HJuhW7')
```

where the single argument is the Account id, and the result will look
something like:

```javascript
{
  success: true,
  account: {
    type: 'account',
    id: 'act_GSzquZ2gyBXsJ9yKB7HJuhW7',
    attributes: {
      referenceId: 'ec9ff3f2-d49f-4cf5-9a3a-66bc628c47d1',
      createdAt: '2022-06-25T11:12:22.000Z',
      updatedAt: '2022-07-06T09:00:28.000Z',
      nameFirst: 'Jacob',
      nameMiddle: null,
      nameLast: 'Woods',
      phoneNumber: '680-206-6197',
      emailAddress: 'yumyum@google.com',
      addressStreet1: '8601 Sugarlimb Rd',
      addressStreet2: null,
      addressCity: 'Loudon',
      addressSubdivision: 'Tennessee',
      addressPostalCode: '377746323',
      countryCode: 'US',
      birthdate: '1998-01-11',
      socialSecurityNumber: '111-22-3333',
      tags: [Array]
    }
  },
  details: {
    requestId: 'be396edb-1999-49ac-acbf-b6694ed56feb',
    runtime: 0.085191
  }
}
```

#### [Create an Account](https://docs.withpersona.com/reference/create-an-account)

You can create an Account by passing in at least some parts of the
`AccountAttributes` object:

```typescript
const resp = await client.account.create({
  referenceId: '7ab50553-67ee-4b59-9adb-dbce7f37af0a',
  nameFirst: 'Jacob',
  nameLast: 'Woods',
  birthdate: '1998-01-11',
  addressStreet1: '8601 Sugarlimb Ave',
  addressCity: 'Loudon',
  addressSubdivision: 'TN',
  addressPostalCode: '37774',
  countryCode: 'US',
  emailAddress: 'jwoods@gmail.com',
  phoneNumber: '312-555-1212',
  socialSecurityNumber: '111-22-3333',
  tags: ['bad-actor', 'trouble'],
})
```

and the result will look something like:

```javascript
{
  success: true,
  account: {
    type: 'account',
    id: 'act_GSzquZ2gyBXsJ9yKB7HJuhW7',
    attributes: {
      referenceId: '7ab50553-67ee-4b59-9adb-dbce7f37af0a',
      nameFirst: 'Jacob',
      nameLast: 'Woods',
      birthdate: '1998-01-11',
      addressStreet1: '8601 Sugarlimb Rd',
      addressCity: 'Loudon',
      addressSubdivision: 'Tennessee',
      addressPostalCode: '377746323',
      countryCode: 'US',
      emailAddress: 'jwoods@gmail.com',
      phoneNumber: '312-555-1212',
      socialSecurityNumber: '111-22-3333',
      tags: [ 'BAD-ACTOR', 'TROUBLE' ],
      createdAt: '2022-07-01T10:58:46.000Z',
      updatedAt: '2022-07-01T10:58:46.000Z',
      nameMiddle: null,
      addressStreet2: null,
    },
  },
  details: {
    requestId: 'efc22741-5d7e-40e5-92b4-7607e841ee57',
    runtime: 0.41911
  }
}
```

#### [Redact an Account](https://docs.withpersona.com/reference/redact-an-account)

You can soft-delete the Accout, and as Persona says:

> Permanently deletes personally identifiable information (PII) for an Account
> and all associated Inquiries, Verifications and Reports. This action cannot
> be undone.
>
> This endpoint can be used to comply with privacy regulations such as
> GDPR / CCPA or to enforce data privacy.
>
> Note: An account is still updatable after redaction. If you want to delete
> data continuously, please reach out to us to help you setup a retention
> policy.

```typescript
const resp = await client.account.delete('act_e9ZNggooRhGywARBeRLo2e4Q')
```

and the result will look something like:

```javascript
{
  success: true,
  account: {
    type: 'account',
    id: 'act_e9ZNggooRhGywARBeRLo2e4Q',
    attributes: {
      referenceId: '7ab50553-67ee-4b59-9adb-dbce7f37af0a',
      createdAt: '2022-07-01T10:58:46.000Z',
      updatedAt: '2022-07-01T11:06:53.000Z',
      nameFirst: null,
      nameMiddle: null,
      nameLast: null,
      phoneNumber: null,
      emailAddress: null,
      addressStreet1: null,
      addressStreet2: null,
      addressCity: null,
      addressSubdivision: null,
      addressPostalCode: null,
      countryCode: null,
      birthdate: null,
      socialSecurityNumber: null,
      tags: [ 'BAD-ACTOR', 'TROUBLE' ],
    },
  },
  details: {
    requestId: 'e988f99c-efe1-4727-af44-ae00d6e870e0',
    runtime: 0.187149
  }
}
```

#### [Update an Account](https://docs.withpersona.com/reference/update-an-account)

You can update much of an existing Account with:

```typescript
const resp = await client.account.update('act_e9ZNggooRhGywARBeRLo2e4Q', {
  emailAddress: 'yumyum@google.com',
})
```

and the result will look similar to the results of `byId()`, above.

#### [Add a Tag](https://docs.withpersona.com/reference/add-a-tag-1)

You can add a tag to an existing Account with the simple call:

```typescript
const resp = await client.account.addTag('act_e9ZNggooRhGywARBeRLo2e4Q', 'bad')
```

and the result will look similar to the results of `byId()`, above. The
tags are all upper-cased by Persona, and uniqued, again, by Persona, so
that you don't have to worry about case or uniqueness in adding tags.

#### [Remove a Tag](https://docs.withpersona.com/reference/remove-a-tag-1)

You can remove a tag from an existing Account with the simple call:

```typescript
const resp = await client.account.removeTag('act_e9ZNggooRhGywARBeRLo2e4Q', 'good')
```

and the result will look similar to the results of `byId()`, above. The
tags are all upper-cased by Persona, and uniqued, again, by Persona, so
that you don't have to worry about case or uniqueness in removing tags.
Also, there is no penalty for removing a tag that doesn't exist.

#### [Set all Tags](https://docs.withpersona.com/reference/set-all-tags-1)

You can set the complete set of tags for an existing Account with the
simple call:

```typescript
const resp = await client.account.setTags('act_e9ZNggooRhGywARBeRLo2e4Q',
 ['bad', 'iffy']
)
```

and the result will look similar to the results of `byId()`, above. The
tags will all be upper-cased by Persona, and uniqued, again, by Persona,
so that you don't have to worry about case or uniqueness in the tags.

#### [Consolidate Accounts](https://docs.withpersona.com/reference/consolidate-into-an-account)

You can consolidate all the assets associated with different Accounts
that are really the same identity with one call. Person describes this
as:

> Consolidates several source Accounts' information into one target
> Account. Any Inquiry, Verification, Report and Document associated
> with the source Account will be transferred over to the destination
> Account. However, the Account's attributes will not be transferred.
> After consolidation, you can update the destination Account's
> attributes using the Account update endpoint.
>
> This endpoint can be used to clean up duplicate Accounts.
>
> Note: A source account can only be consolidated once. Afterwards,
> the source account will be archived.


```typescript
const resp = await client.account.consolidate(destAcctId,
  [srcAcctId1, srcAcctId2, srcAcctId3]
)
```

where the first argument is the _destination_ `accountId`, and the second
is an array of `accountId` values to _merge_ onto the destination. The
result will look similar to the results of `byId()`, above.

### Inquiry Calls

As stated in the Persona
[documentation](https://docs.withpersona.com/reference/inquiries-api):

> The inquiry represents a single instance of an individual attempting to
> verify their identity. The primary use of the inquiry endpoints is to
> fetch submitted information from the flow.
>
> Inquiries are created when the individual begins to verify their
> identity. Check for the following statuses to determine whether the
> individual has finished the flow. See [Models & Lifecycle](https://docs.withpersona.com/docs/models-lifecycle#lifecycle) for a detailed
> overview of how an individual verifies their identity.

#### [List all Inquiries](https://docs.withpersona.com/reference/list-all-inquiries)

You can get a list of all Inquiries at Persona with no arguments:

```typescript
const resp = await client.inquiry.list()
```

and the result will look something like:

```javascript
{
  success: true,
  inquiries: [
    {
      type: 'inquiry',
      id: 'inq_i8EnS9TdG2NqZcXbEQcaPSo9',
      attributes: [Object],
      relationships: [Object]
    },
    {
      type: 'inquiry',
      id: 'inq_y8Bqa4JpKFtxdWGkgEEdRtcC',
      attributes: [Object],
      relationships: [Object]
    },
    {
      type: 'inquiry',
      id: 'inq_QsYJm8yq8yjKdHqyAwKBFb64',
      attributes: [Object],
      relationships: [Object]
    },
    {
      type: 'inquiry',
      id: 'inq_2dB7wPwdUJYmf3ytKaxoXZRF',
      attributes: [Object],
      relationships: [Object]
    },
    ...
  ],
  details: {
    requestId: '86f6aed9-c170-44dd-963d-4cb870fcad66',
    runtime: 0.225322
  }
}
```

where the `[Object]` value of the `attributes` keys will look something
like:

```javascript
{
  status: 'completed',
  referenceId: '7f2ca97f-a110-4f2d-b00e-0d648857db69',
  note: null,
  behaviors: [Object],
  tags: [],
  creator: 'API',
  reviewerComment: null,
  createdAt: '2022-07-01T10:36:59.000Z',
  startedAt: '2022-07-01T10:36:59.000Z',
  completedAt: '2022-07-01T10:37:00.000Z',
  failedAt: null,
  decisionedAt: null,
  expiredAt: null,
  redactedAt: null,
  previousStepName: null,
  nextStepName: null,
  nameFirst: 'Tralisha',
  nameMiddle: null,
  nameLast: 'Fenton',
  birthdate: '1998-01-11',
  addressStreet1: '327 Briarbend Rd',
  addressStreet2: null,
  addressCity: 'Goose Creek',
  addressSubdivision: 'South Carolina',
  addressSubdivisionAbbr: 'SC',
  addressPostalCode: '294457778',
  addressPostalCodeAbbr: '29445',
  socialSecurityNumber: '111-22-3333',
  emailAddress: '3hwx94mq@smuggroup.com',
  phoneNumber: '903-991-3776',
  fields: [Object],
}

```

and the `[Object]` value of the `relationships` will look something
like:

```javascript
{
  account: { data: { type: 'account', id: 'act_wUWs7RWHpvWy9gnw4uqqnS3B' } },
  template: { data: { type: 'template', id: 'tmpl_PPDFW92MxhJLomjh4gC2tb5x' } },
  inquiryTemplate: { data: null },
  inquiryTemplateVersion: { data: null },
  reviewer: { data: null },
  reports: { data: [] },
  verifications: { data: [] },
  sessions: { data: [ [Object] ] },
  documents: { data: [] },
  selfies: { data: [] }
}
```

There are several optional parameters to many of the Persona calls,
and they are all included in the call in this format:

```typescript
const resp = await client.inquiry.list({
  size: 20,
})
```

and for this call, the options are:

* `beforeId` - the id of the Inquiry that will be the terminal inquiry
  for the list
* `afterId` - the id of the Inquiry that won't appear on the list, and
  is often the _last_ id from the previous paging fetch of the list.
* `size` - the number of elements to return
* `filterRefId` - the `referenceId` to filter based on that value
  being supplied by the user when the Inquiry was created.
* `filterAcctId` - the `accountId` to filter based on the Account id
  used as the basis of this Inquiry.


#### [Retrieve an Inquiry](https://docs.withpersona.com/reference/apiv1inquiriesinquiry-id)

You can get a specific Inquiry at Person with just the `inquiryId`:

```typescript
const resp = await client.inquiry.byId('inq_hckCfzvWeT3YEkkmVGzAuxKn')
```

and the result will look something like:

```javascript
{
  success: true,
  inquiry: {
    type: 'inquiry',
    id: 'inq_hckCfzvWeT3YEkkmVGzAuxKn',
    attributes: {
      status: 'expired',
      referenceId: null,
      note: null,
      behaviors: {
        requestSpoofAttempts: null,
        userAgentSpoofAttempts: null,
        distractionEvents: null,
        hesitationBaseline: null,
        hesitationCount: null,
        hesitationTime: null,
        shortcutCopies: null,
        shortcutPastes: null,
        autofillCancels: null,
        autofillStarts: null,
        devtoolsOpen: null,
        completionTime: null,
        hesitationPercentage: null,
        behaviorThreatLevel: null
      },
      tags: [],
      creator: 'bobby.baek+flexbase@withpersona.com',
      reviewerComment: null,
      createdAt: '2022-06-28T20:54:14.000Z',
      startedAt: null,
      completedAt: null,
      failedAt: null,
      decisionedAt: null,
      expiredAt: '2022-06-29T20:54:31.000Z',
      redactedAt: null,
      previousStepName: null,
      nextStepName: null,
      nameFirst: null,
      nameMiddle: null,
      nameLast: null,
      birthdate: null,
      addressStreet1: null,
      addressStreet2: null,
      addressCity: null,
      addressSubdivision: null,
      addressSubdivisionAbbr: null,
      addressPostalCode: null,
      addressPostalCodeAbbr: null,
      socialSecurityNumber: null,
      emailAddress: null,
      phoneNumber: null,
      fields: {
        birthdate: [Object],
        nameLast: [Object],
        nameFirst: [Object],
        nameMiddle: [Object],
        addressCity: [Object],
        phoneNumber: [Object],
        emailAddress: [Object],
        addressStreet1: [Object],
        addressStreet2: [Object],
        addressPostalCode: [Object],
        addressSubdivision: [Object],
        addressCountryCode: [Object],
        socialSecurityNumber: [Object]
      },
    },
    relationships: {
      account: { data: { type: 'account', id: 'act_wUWs7RWHpvWy9gnw4uqqnS3B' } },
      template: { data: { type: 'template', id: 'tmpl_PPDFW92MxhJLomjh4gC2tb5x' } },
      inquiryTemplate: { data: null },
      inquiryTemplateVersion: { data: null },
      reviewer: { data: null },
      reports: { data: [] },
      verifications: { data: [] },
      sessions: { data: [ [Object] ] },
      documents: { data: [] },
      selfies: { data: [] }
    }
  },
  details: {
    requestId: '4b1e7bcd-be12-4fe8-af6b-dc41e8b230ae',
    runtime: 0.09918
  }
}
```

#### [Print Inquiry PDF](https://docs.withpersona.com/reference/print-an-inquiry-pdf)

You can get a PDF bytestream of an Inquiry by it's `inquiryId`:

```typescript
const resp = await client.inquiry.print('inq_hckCfzvWeT3YEkkmVGzAuxKn')
```

and the result will look something like:

```javascript
{
  success: true,
  inquiry: {
    id: 'inq_hckCfzvWeT3YEkkmVGzAuxKn',
    body: Gunzip {
      _writeState: [Uint32Array],
      _readableState: [ReadableState],
      _events: [Object: null prototype],
      _eventsCount: 4,
      _maxListeners: undefined,
      _writableState: [WritableState],
      allowHalfOpen: true,
      bytesWritten: 217026,
      _handle: null,
      _outBuffer: <Buffer 20 0a 30 30 30 30 32 32 38 39 30 38 20 30 30
       30 30 30 20 6e 20 0a 30 30 30 30 32 32 39 35 36 36 20 30 30 30
       30 30 20 6e 20 0a 30 30 30 30 32 32 39 36 ... 16334 more bytes>,
      _outOffset: 911,
      _chunkSize: 16384,
      _defaultFlushFlag: 2,
      _finishFlushFlag: 2,
      _defaultFullFlushFlag: 3,
      _info: undefined,
      _maxOutputLength: 4294967296,
      _level: -1,
      _strategy: 0,
      [Symbol(kCapture)]: false,
      [Symbol(kCallback)]: null,
      [Symbol(kError)]: null
    }
  }
}
```

#### [Create an Inquiry](https://docs.withpersona.com/reference/apiv1inquiriesinquiry-id-2)

You can create an Inquiry with:

```typescript
const resp = await client.inquiry.create({
  templateId: 'tmpl_PP...',
  referenceId: '5f81c440-088a-4d71-8980-cdd2565abc8f'
})
```

and the result will look something very similar to the output of the `byId()`
function.

#### [Update an Inquiry](https://docs.withpersona.com/reference/apiv1inquiriesinquiry-id-3)

You can update the data for an Inquiry:

```typescript
const resp = await client.inquiry.update(inquiryId, {
  reviewerComment: 'looking good',
})
```

We need to do additional testing on the output of this call, but it
should work... but is, as yet, untested.

#### [Resume an Inquiry](https://docs.withpersona.com/reference/apiv1inquiriesinquiry-idresume)

You can resume an Inquiry in it's workflow, in the word of the
Persona docs:

> Resumes an existing inquiry. If the inquiry is in a pending state,
> you must also specify a session token generated from this endpoint.

```typescript
const resp = await client.inquiry.resume(inquiryId)
```

We need to do additional testing on the output of this call, but it
should work... but is, as yet, untested.

#### [Approve an Inquiry](https://docs.withpersona.com/reference/apiv1inquiriesinquiry-idapprove)

You can approve an Inquiry manually with:

```typescript
const resp = await client.inquiry.approve(inquiryId)
```

We need to do additional testing on the output of this call, but it
should work... but is, as yet, untested.

#### [Decline an Inquiry](https://docs.withpersona.com/reference/apiv1inquiriesinquiry-iddecline)

You can decline an Inquiry manually with:

```typescript
const resp = await client.inquiry.decline(inquiryId)
```

We need to do additional testing on the output of this call, but it
should work... but is, as yet, untested.

#### [Redact an Inquiry](https://docs.withpersona.com/reference/apiv1inquiriesinquiry-id-1)

You can soft-delete an Inquiry by redacting all the PII on it, in the
words of the Person docs:

> Permanently deletes personally identifiable information (PII) for
> an Inquiry and all associated Verifications and Reports. This action
> cannot be undone.
>
> This endpoint can be used to comply with privacy regulations such
> as GDPR / CCPA or to enforce data privacy.

```typescript
const resp = await client.inquiry.delete(inquiryId)
```

We need to do additional testing on the output of this call, but it
should work... but is, as yet, untested.

#### [Add a Tab](https://docs.withpersona.com/reference/add-a-tag)

You can add a tag to an existing Inquiry with the simple call:

```typescript
const resp = await client.inquiry.addTag('inq_2rs9qsQ1D5GJgmeMK7ktnzo1', 'bad')
```

and the result will look similar to the results of `byId()`, above. The
tags are all upper-cased by Persona, and uniqued, again, by Persona, so
that you don't have to worry about case or uniqueness in adding tags.

#### [Remove a Tag](https://docs.withpersona.com/reference/remove-a-tag)

You can remove a tag from an existing Inquiry with the simple call:

```typescript
const resp = await client.inquiry.removeTag('inq_2rs9qsQ1D5GJgmeMK7ktnzo1', 'good')
```

and the result will look similar to the results of `byId()`, above. The
tags are all upper-cased by Persona, and uniqued, again, by Persona, so
that you don't have to worry about case or uniqueness in removing tags.
Also, there is no penalty for removing a tag that doesn't exist.

#### [Set all Tags](https://docs.withpersona.com/reference/set-all-tags)

You can set the complete set of tags for an existing Inquiry with the
simple call:

```typescript
const resp = await client.inquiry.setTags('inq_2rs9qsQ1D5GJgmeMK7ktnzo1',
 ['bad', 'iffy']
)
```

and the result will look similar to the results of `byId()`, above. The
tags will all be upper-cased by Persona, and uniqued, again, by Persona,
so that you don't have to worry about case or uniqueness in the tags.

### Verification Calls

As stated in the Persona
[documentation](https://docs.withpersona.com/reference/verifications):

> A verification represents one of multiple checks done by an individual.
> An inquiry contains one or more verifications. The attributes available
> for any given verification depends on its type. Each inquiry’s
> relationships field lists the IDs of all associated verifications.
> To authenticate when fetching photo URLs, pass the same Authorization
> header.
>
> Verifications change statuses as the individual progresses through the
> flow. Check for the following statuses to monitor progress and find
> completed results.

#### [Retrieve a Verification](https://docs.withpersona.com/reference/apiv1verificationsverification-id)

You can retrieve a Verification with simply the `verificationId`:

```typescript
const resp = await client.verification.byId('ver_6JxUgEi2GyMMXQ1vZUFYSGWS')
```

and the result will look something like:

```javascript
{
  success: true,
  verification: {
    type: 'verification/database',
    id: 'ver_JpPzxVnDz9P9tWs7UagHj7Gh',
    attributes: {
      status: 'submitted',
      createdAt: '2022-07-06T09:03:46.000Z',
      createdAtTs: 1657098226,
      submittedAt: '2022-07-06T09:03:47.000Z',
      submittedAtTs: 1657098227,
      completedAt: null,
      completedAtTs: null,
      countryCode: 'US',
      nameFirst: 'Tralisha',
      nameMiddle: null,
      nameLast: 'Fenton',
      addressStreet1: '327 Briarbend Rd',
      addressStreet2: null,
      addressCity: 'Goose Creek',
      addressSubdivision: 'SC',
      addressPostalCode: '29445-7778',
      birthdate: '1998-01-11',
      phoneNumber: '903-991-3776',
      emailAddress: '3hwx94mq@smuggroup.com',
      checks: []
    },
    relationships: { inquiry: [Object] }
  },
  details: {
    requestId: '6f0be052-502a-4e5c-8818-8df961128521',
    runtime: 0.057535
  }
}
```

#### [Print Verification PDF](https://docs.withpersona.com/reference/print-a-verification-as-pdf)

You can get a PDF print-out of a Verification with:

```typescript
const resp = await client.verification.print('ver_6JxUgEi2GyMMXQ1vZUFYSGWS')
```

and the result will look something like:

```javascript
{
  success: true,
  verification: {
    id: 'ver_6JxUgEi2GyMMXQ1vZUFYSGWS',
    body: Gunzip {
      _writeState: [Uint32Array],
      _readableState: [ReadableState],
      _events: [Object: null prototype],
      _eventsCount: 4,
      _maxListeners: undefined,
      _writableState: [WritableState],
      allowHalfOpen: true,
      bytesWritten: 217026,
      _handle: null,
      _outBuffer: <Buffer 20 0a 30 30 30 30 32 32 38 39 30 38 20 30 30
       30 30 30 20 6e 20 0a 30 30 30 30 32 32 39 35 36 36 20 30 30 30
       30 30 20 6e 20 0a 30 30 30 30 32 32 39 36 ... 16334 more bytes>,
      _outOffset: 911,
      _chunkSize: 16384,
      _defaultFlushFlag: 2,
      _finishFlushFlag: 2,
      _defaultFullFlushFlag: 3,
      _info: undefined,
      _maxOutputLength: 4294967296,
      _level: -1,
      _strategy: 0,
      [Symbol(kCapture)]: false,
      [Symbol(kCallback)]: null,
      [Symbol(kError)]: null
    }
  }
}
```

### Database Verification Calls

A subset of the Verification system is a simple Database Verification where
the static data for an identity is sent to Person, and it runs through a
series of databases looking to see if it matches a bad actor.

#### Retrieve Database Verification

You can retrieve a Database Verification with simply the `verificationId`:

```typescript
const resp = await client.verification.database.byId(verificationId)
```

and the result will look very much like the response from `byId()` for
a general Verification.

#### Create a Database Verification

You can create a Database Verification simply:

```typescript
const resp = await client.verification.database.create({
  inquiryId,
  nameFirst: 'James',
  nameLast: 'Woods',
  addressStreet1: '327 Briarbend Ave',
  addressCity: 'Goose Creek',
  addressSubdivision: 'SC',
  addressPostalCode: '29445',
  identificationNumber: '111-22-3333',
  birthdate: '1998-01-11',
  phoneNumber: '312-555-1212',
  emailAddress: 'yoy@gogole.com',
  countryCode: 'US',
})
```

and the result will look very much like the response from `byId()` for
a general Verification.

#### Submit a Database Verification

Once created, a Database Verification must be submitted to be processed,
and that is done simply with:

```typescript
const resp = await client.verification.database.submit(verificationId)
```

and the result will look very much like the response from `byId()` for
a general Verification, but the `status` in the data will likely have
changed from `created` to `submitted`. It will then be on the caller
to either waut for the webhook messaging of the completion of the
Verification, or to use the `byId()` function to poll Persona until
the `status` changes to a terminal condition.

#### Synchronously Run a Database Verification

Because it's a simple process, it makes sense to have a _synchronous_
way to create, submit, and monitor a Database Verification so that
you can do this "while waiting". This can be done with the code in
the client:

```typescript
const resp = await client.verification.database.run({
  inquiryId,
  nameFirst: 'James',
  nameLast: 'Woods',
  addressStreet1: '327 Briarbend Ave',
  addressCity: 'Goose Creek',
  addressSubdivision: 'SC',
  addressPostalCode: '29445',
  identificationNumber: '111-22-3333',
  birthdate: '1998-01-11',
  phoneNumber: '312-555-1212',
  emailAddress: 'yoy@gogole.com',
  countryCode: 'US',
})
```

where the inputs are the same as the `create()` function, and the
result will look very much like the response from `byId()` for
a general Verification, but the `status` will be a terminal case.

The one addition is the `stage` attribute of the output. This will
go through the four stages of processing:

* `create` - if there was an error in the `create()` call, this will be
  in the output, along with the error(s).
* `submit` - the there wa an error in the `submit()` call, this will be
  in the output, along with the error(s)
* `complete` - if the verification completes, then this will be in the
  output and the `status` in the `verification` should be read for a
  final disposition.
* `processing` - if, after 30 sec, nothing has changed, then this will
  be returned in the output, along with the latest data from `byId()`.

The idea is that the errors are tagged with the call they occurred on,
and that will help the caller know what happened, when.


## Development

For those interested in working on the library, there are a few things that
will make that job a little simpler. The organization of the code is all in
`src/`, with one module per _section_ of the Client: `account`, `inquiry`,
etc. This makes location of the function very easy.

Additionally, the main communication with the Persona service is in the
`src/index.ts` module in the `fire()` function. In the constructor for the
Client, each of the _sections_ are created, and then they link back to the
main class for their communication work.

### Setup

In order to work with the code, the development dependencies include `dotenv`
so that each user can create a `.env` file with a single value for working
with Persona:

* `PERSONA_API_KEY` - this is the Persona-generated "API key" from the
  Persona API Keys page.

### Testing

There are several test scripts that test, and validate, information on the
Persona service exercising different parts of the API. Each is
self-contained, and can be run with:

```bash
$ npm run ts tests/verification.ts

creating new Inquiry based off Database Template...
Success! we have created the new Inquiry inq_Cw4YUBJQDwSmasqN3ZVYpGri
running Database Verification for Inquiry inq_Cw4YUBJQDwSmasqN3ZVYpGri...
TWO {
  success: true,
  verification: {
    type: 'verification/database',
    id: 'ver_XmdrvsgCSSXfiSLpbL42Zywg',
    attributes: {
      status: 'passed',
      createdAt: '2022-06-30T16:25:26.000Z',
      createdAtTs: 1656606326,
      submittedAt: '2022-06-30T16:25:27.000Z',
      submittedAtTs: 1656606327,
      completedAt: '2022-06-30T16:25:27.000Z',
      completedAtTs: 1656606327,
      countryCode: 'US',
      nameFirst: 'Tralisha',
      nameMiddle: null,
      nameLast: 'Fenton',
      addressStreet1: '327 Briarbend Rd',
      addressStreet2: null,
      addressCity: 'Goose Creek',
      addressSubdivision: 'SC',
      addressPostalCode: '29445-7778',
      birthdate: '1998-01-11',
      phoneNumber: '903-991-3776',
      emailAddress: '3hwx94mq@smuggroup.com',
      checks: [ [Object], [Object], [Object], [Object], [Object], [Object] ],
    },
    relationships: { inquiry: [Object] }
  },
  details: {
    requestId: 'e578d72c-7b96-4be5-b078-c41564f994a1',
    runtime: 0.114366
  },
  stage: 'complete'
}
Success! created the Database Verification ver_XmdrvsgCSSXfiSLpbL42Zywg
```

Each of the tests will run a series of calls through the Client, and check the
results to see that the operation succeeded. As shown, if the steps all
report back with `Success!` then things are working.

If there is an issue with one of the calls, then an `Error!` will be printed
out, and the data returned from the client will be dumped to the console.
