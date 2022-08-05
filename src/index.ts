import fetch from 'node-fetch'
import FormData = require('formdata')
import path from 'path'

import { AccountApi } from './account'
import { InquiryApi } from './inquiry'
import { VerificationApi } from './verification'
import { ReportApi } from './report'

const ClientVersion = require('../package.json').version
const PROTOCOL = 'https'
const PERSONA_HOST = 'withpersona.com/api/v1'
const PERSONA_VER = '2021-07-05'
const KEY_INFLECTION = 'camel'

/*
 * These are the acceptable options to the creation of the Client:
 *
 *   {
 *     host: 'withpersona.com/api/v1',
 *     apiKey: 'persona_sandbox_abcdefg123456xyz',
 *     keyInflection: 'camel',
 *     personaVersion: '2021-07-05',
 *   }
 *
 * and the construction of the Client will use this data for all
 * calls made to Persona.
 */
export interface PersonaOptions {
  host?: string;
  apiKey?: string;
  keyInflection?: string;
  personaVersion?: string;
}

/*
 * These are the standard error objects from Persona - and will be returned
 * from Persona for any bad condition. We will allow these - as well as just
 * strings in the errors being returned from the calls.
 */
export interface PersonaError {
  type: string;
  code?: string;
  message?: string;
  causes?: PersonaErrorDetail[];
}

export interface PersonaErrorDetail {
  title?: string;
  details?: string;
}

/*
 * These are the details about a call to Persona, they are the 'metadata'
 * of the call, and represent the paging information, if applicable, as
 * well as the Request-Id for helping with support at Persona, and the
 * reported runtime at Persona.
 */
export interface PersonaCallDetails {
  prev?: string;
  next?: string;
  requestId?: string;
  runtime?: number;
}

/*
 * Persaon includes some metadata about the Report on the Report calls,
 * and this is the structure of that report metadata.
 */
export interface PersonaIncluded {
  type?: string;
  id?: string;
  attributes?: {
    name: string;
    createdAt: string;
    updatedAt?: string;
  };
  meta?: {
    version?: {
      name: string;
      createdAt: string;
      updatedAt?: string;
    };
  };
}

/*
 * This is the main constructor of the Persona Client, and will be called
 * with something like:
 *
 *   import { Persona } from "persona-node-client"
 *   const client = new Persona({
 *     apiKey: '54321dcba77884',
 *     keyInflection: 'camel',
 *   })
 */
export class Persona {
  host: string
  apiKey: string
  keyInflection: string
  personaVersion: string
  account: AccountApi
  inquiry: InquiryApi
  verification: VerificationApi
  report: ReportApi

  constructor (apiKey: string, options?: PersonaOptions) {
    this.host = options?.host ?? PERSONA_HOST
    this.personaVersion = options?.personaVersion ?? PERSONA_VER
    this.apiKey = options?.apiKey ?? apiKey
    this.keyInflection = options?.keyInflection ?? KEY_INFLECTION
    // now construct all the specific domain objects
    this.account = new AccountApi(this, options)
    this.inquiry = new InquiryApi(this, options)
    this.verification = new VerificationApi(this, options)
    this.report = new ReportApi(this, options)
  }

  /*
   * Function to fire off a GET, PUT, POST, (method) to the uri, preceeded
   * by the host, with the optional query params, and optional body, and
   * puts the 'apiKey' into the headers for the call, and fires off the call
   * to the Persona host and returns the response.
   */
  async fire(
    method: string,
    uri: string,
    headers?: any,
    query?: { [index: string] : number | string | string[] | boolean },
    body?: object | object[] | FormData,
  ): Promise<{
    response: any,
    payload?: any,
    details?: PersonaCallDetails,
    included?: PersonaIncluded,
  }> {
    // build up the complete url from the provided 'uri' and the 'host'
    let url = new URL(PROTOCOL+'://'+path.join(this.host, uri))
    if (query) {
      Object.keys(query).forEach(k => {
        if (something(query![k])) {
          url.searchParams.append(k, query![k].toString())
        }
      })
    }
    const isForm = isFormData(body)
    // make the appropriate headers
    headers = { ...headers,
      Accept: 'application/json',
      'X-Persona-Client-Ver': ClientVersion,
      'Key-Inflection': this.keyInflection,
      Authorization: `Bearer ${this.apiKey}`,
      'Persona-Version': this.personaVersion,
    } as any
    if (!isForm) {
      headers = { ...headers, 'Content-Type': 'application/json' }
    }
    // allow a few retries on the authentication token expiration
    let response: any
    try {
      response = await fetch(url, {
        method: method,
        body: isForm ? (body as any) : (body ? JSON.stringify(body) : undefined),
        headers,
        redirect: 'follow',
      })
      const payload = await response?.json()
      const details = removeEmpty({
        prev: payload?.links?.prev,
        next: payload?.links?.next,
        requestId: response?.headers.get('x-request-id'),
        runtime: atof(response?.headers.get('x-runtime')),
      })
      const included = payload?.included
      return { response, payload, details, included }
    } catch (err) {
      return { response }
    }
  }
}

/*
 * Simple function used to weed out undefined and null query params before
 * trying to place them on the call.
 */
function something(arg: any) {
  return arg || arg === false || arg === 0 || arg === ''
}

/*
 * Function to examine the argument and see if it's 'empty' - and this will
 * work for undefined values, and nulls, as well as strings, arrays, and
 * objects. If it's a regular data type - then it's "not empty" - but this
 * will help know if there's something in the data to look at.
 */
export function isEmpty(arg: any): boolean {
  if (arg === undefined || arg === null) {
    return true
  } else if (typeof arg === 'string' || Array.isArray(arg)) {
    return arg.length == 0
  } else if (typeof arg === 'object') {
    return Object.keys(arg).length == 0
  }
  return false
}

/*
 * Simple predicate function to return 'true' if the argument is a FormData
 * object - as that is one of the possible values of the 'body' in the fire()
 * function. We have to handle that differently on the call than when it's
 * a more traditional JSON object body.
 */
function isFormData(arg: any): boolean {
  let ans = false
  if (arg && typeof arg === 'object') {
    ans = (typeof arg._boundary === 'string' &&
           arg._boundary.length > 20 &&
           Array.isArray(arg._streams))
  }
  return ans
}

/*
 * Convenience function to create a PersonaError based on a simple message
 * from the Client code. This is an easy way to make PersonaError instances
 * from the simple error messages we have in this code.
 */
export function mkError(message: string): PersonaError {
  return {
    type: 'client',
    message,
  }
}

/*
 * Simple function the make sure the argument is a number - string or not.
 * This works by defaulting to 0, even in the case of 'undefined' values.
 */
function atof(arg: any): any {
  if (typeof arg === 'number') {
    return arg
  } else if (typeof arg === 'string') {
    return Number((arg || '0').replace(/,|\$/g, ''))
  } else if (Array.isArray(arg)) {
    return arg.map(x => atof(x))
  }
  return 0
}

/*
 * Function to recursively remove all the 'empty' values from the provided
 * Object and return what's left. This will not cover the complete boolean
 * falsey set.
 */
export function removeEmpty(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(itm => removeEmpty(itm)) }
  else if (typeof obj === 'object') {
    return Object.entries(obj)
      .filter(([_k, v]) => !isEmpty(v))
      .reduce(
        (acc, [k, v]) => (
          { ...acc, [k]: v === Object(v) ? removeEmpty(v) : v }
        ), {}
      )
  }
  return obj
}

/*
 * Function to create the 'standard' Persona headers from the options
 * supplied to many of the functions in this library. This just saves
 * code and time.
 */
export function mkHeaders(arg: any): any {
  let ans = {} as any
  if (!isEmpty(arg?.idempotencyKey)) {
    ans['Idempotency-Key'] = arg.idempotencyKey
  }
  return ans
}

/*
 * Function to create the 'standard' Persona query params from the options
 * supplied to many of the functions in this library. This just saves
 * code and time.
 */
export function mkQueryParams(arg: any): any {
  let ans = {} as any
  if (!isEmpty(arg?.beforeId)) {
    ans['page[before]'] = arg.beforeId
  }
  if (!isEmpty(arg?.afterId)) {
    ans['page[after]'] = arg.afterId
  }
  if (!isEmpty(arg?.size)) {
    ans['page[size]'] = arg.size
  }
  if (!isEmpty(arg?.filterRefId)) {
    ans['filter[reference-id]'] = arg.filterRefId
  }
  if (!isEmpty(arg?.filterAcctId)) {
    ans['filter[account-id]'] = arg.filterAcctId
  }
  return ans
}
