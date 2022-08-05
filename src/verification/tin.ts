import type { Persona, PersonaOptions, PersonaError, PersonaCallDetails } from '../'
import type { VerificationRelationships, VerificationCheck } from './'

export interface Verification {
  type?: string;
  id?: string;
  attributes?: VerificationAttributes;
  relationships?: VerificationRelationships;
}

export interface VerificationAttributes {
  status?: string;
  createdAt?: string;
  createdAtTs?: number;
  submittedAt?: string;
  submittedAtTs?: number;
  completedAt?: string;
  completedAtTs?: number;
  countryCode?: string;
  nameFirst?: string;
  nameLast?: string;
  tin?: string;
  tinType?: string;
  checks: VerificationCheck[];
}

import { setTimeout } from 'timers/promises'
import { isEmpty } from '../'

export class DatabaseTINApi {
  client: Persona
  tinTemplateId?: string

  constructor(client: Persona, options?: PersonaOptions) {
    this.client = client
    // now pick off any verification templates in the options
    this.tinTemplateId = options?.verifications?.tinTemplateId
  }

  /*
   * Function to take an 'verificationId' for a Database TIN Verification that
   * should already exist in the system, and return that, if it exists.
   */
  async byId(verificationId: string): Promise<{
    success: boolean,
    verification?: Verification,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    return await this.client.verification.byId(verificationId)
  }

  /*
   * Function to create a new Database TIN Verification based on the provided
   * data. This will be the Tax ID, or EIN, as well as the Company Name, and
   * can then be submitted for verification with the submit() function.
   */
  async create(data: {
    nameBusiness: string,
    tin: string,
    verificationTemplateId?: string,
    countryCode?: string,
  }): Promise<{
    success: boolean,
    verification?: Verification,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    // pull in the template id if we have it in the client
    data.verificationTemplateId = data.verificationTemplateId ?? this.tinTemplateId
    const resp = await this.client.fire(
      'POST',
      'verification/database-tins',
      undefined,
      undefined,
      {
        data: {
          type: 'verification/database-tin',
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
    return { success: true, verification: resp?.payload?.data, details: resp?.details }
  }

  /*
   * Function to submit a Database TIN Verification to be processed by the
   * engine. This will return the status of that processing.
   */
  async submit(verificationId: string): Promise<{
    success: boolean,
    verification?: Verification,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'POST',
      `verification/database-tins/${verificationId}/submit`,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.errors)) {
      return {
        success: false,
        error: { type: 'persona', causes: resp?.payload?.errors },
        details: resp?.details,
      }
    }
    return { success: true, verification: resp?.payload?.data, details: resp?.details }
  }

  /*
   * Function to do a synchronous Database TIN Verification of the supplied
   * Company data with Persona, and this really just encapsulates the
   * call to 'create()' to create the Verification, then 'submit()' to
   * submit it for verification, and then 'byId()' to get the status.
   *
   * If the Verification's status is still 'submitted', we will wait a
   * total of 20 sec in 500 msec intervals waiting for the Database
   * TIN Verification to be complete. The hope is that this will make it
   * a simpler synchronous call, to be used when time isn't critical.
   *
   * If an error occurs at any stage in the processing, the latest
   * results are returned, with the stage the error occurred.
   */
  async run(data: {
    nameBusiness: string,
    tin: string,
    verificationTemplateId?: string,
    countryCode?: string,
  }): Promise<{
    success: boolean,
    stage: string,
    verification?: Verification,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    // pull in the template id if we have it in the client
    data.verificationTemplateId = data.verificationTemplateId ?? this.tinTemplateId
    // start with creating the Database TIN Verification...
    const make = await this.create(data)
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
      if (chk?.success && chk?.verification?.attributes?.completedAt) {
        return { ...chk, stage: 'complete' }
      }
      cnt = cnt + 1
    }

    // if we are here, the verification process did not complete - flag it
    return { ...chk, stage: 'processing' }
  }
}
