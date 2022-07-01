import type { Persona, PersonaOptions, PersonaError, PersonaCallDetails } from '../'
import type { Verification } from './'

import { setTimeout } from 'timers/promises'
import { mkHeaders, isEmpty } from '../'

export class DatabaseApi {
  client: Persona

  constructor(client: Persona, _options?: PersonaOptions) {
    this.client = client
  }

  /*
   * Function to take an 'verificationId' for a Database Verification that
   * should already exist in the system, and return that, if it exists.
   */
  async byId(verificationId: string): Promise<{
    success: boolean,
    verification?: Verification,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'GET',
      `verification/databases/${verificationId}`,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.errors)) {
      return {
        success: false,
        error: { type: 'persona', causes: resp?.payload?.errors },
        details: resp?.details,
      }
    }
    // build up the Verification from the data out of Persona
    const verification = {
      ...resp?.payload?.data?.attributes,
      id: resp?.payload?.data?.id,
    }
    return { success: true, verification, details: resp?.details }
  }

  /*
   * Function to create a new Database Verification based on the provided data.
   * This will be the person and will be attached to an Inquiry, via the
   * inquiryId argument, and can then be submitted for verification with the
   * submit() function.
   */
  async create(data: {
    inquiryId: string,
    nameFirst: string,
    nameLast: string,
    addressStreet1: string,
    addressStreet2?: string,
    addressCity: string,
    addressSubdivision: string,
    addressPostalCode: string,
    identificationNumber: string,
    birthdate: string,
    phoneNumber?: string,
    emailAddress?: string,
    countryCode?: string,
  }, options?: {
    idempotencyKey?: string,
  }): Promise<{
    success: boolean,
    verification?: Verification,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'POST',
      'verification/databases',
      mkHeaders(options),
      undefined,
      {
        data: {
          type: 'verification/database',
          attributes: { ...data }
        },
      },
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.errors)) {
      return {
        success: false,
        error: { type: 'persona', causes: resp?.payload?.errors },
        details: resp?.details,
      }
    }
    // build up the Verification from the data out of Persona
    const verification = {
      ...resp?.payload?.data?.attributes,
      id: resp?.payload?.data?.id,
    }
    return { success: true, verification, details: resp?.details }
  }

  /*
   * Function to submit a Database Verification to be processed by the
   * engine. This will return the statud of that processing.
   */
  async submit(verificationId: string): Promise<{
    success: boolean,
    verification?: Verification,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'POST',
      `verification/databases/${verificationId}/submit`,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.errors)) {
      return {
        success: false,
        error: { type: 'persona', causes: resp?.payload?.errors },
        details: resp?.details,
      }
    }
    // build up the Verification from the data out of Persona
    const verification = {
      ...resp?.payload?.data?.attributes,
      id: resp?.payload?.data?.id,
    }
    return { success: true, verification, details: resp?.details }
  }

  /*
   * Function to do a synchronous Database Verification of the supplied
   * identity data with Persona, and this really just encapsulates the
   * call to 'create()' to create the Verification, then 'submit()' to
   * submit it for verification, and then 'byId()' to get the status.
   *
   * If the Verification's status is still 'submitted', we will wait a
   * total of 20 sec in 500 msec intervals waiting for the Database
   * Verification to be complete. The hope is that this will make it
   * a simpler synchronous call, to be used when time isn't critical.
   *
   * If an error occurs at any stage in the processing, the latest
   * results are returned, with the stage the error occurred.
   */
  async run(data: {
    inquiryId: string,
    nameFirst: string,
    nameLast: string,
    addressStreet1: string,
    addressStreet2?: string,
    addressCity: string,
    addressSubdivision: string,
    addressPostalCode: string,
    identificationNumber: string,
    birthdate: string,
    phoneNumber?: string,
    emailAddress?: string,
    countryCode?: string,
  }, options?: {
    idempotencyKey?: string,
  }): Promise<{
    success: boolean,
    stage: string,
    verification?: Verification,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    // start with creating the Database Verification...
    const make = await this.create(data, options)
    if (!make?.success) {
      return { ...make, stage: 'create' }
    }
    const verificationId = make.verification?.id!

    // now let's submit this Verification to be processed...
    const send = await this.submit(verificationId)
    if (!send?.success) {
      return { ...send, stage: 'submit' }
    }

    // now wait a bit to get it - as we want to be synchronous on this
    let cnt = 0
    let chk: any
    while (cnt < 60) {
      // wait a bit, as we know Persona will take a few sec...
      await setTimeout(500)
      chk = await this.byId(verificationId)
      if (chk?.success && chk?.verification?.status !== 'submitted') {
        return { ...chk, stage: 'complete' }
      }
      cnt = cnt + 1
    }

    // if we are here, the verification process did not complete - flag it
    return { ...chk, stage: 'processing' }
  }
}
