import type { Persona, PersonaOptions, PersonaError, PersonaCallDetails } from '../'

import { DatabaseApi } from './database'

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
  nameMiddle?: string;
  nameLast?: string;
  addressStreet1?: string;
  addressStreet2?: string;
  addressCity?: string;
  addressSubdivision?: string;
  addressPostalCode?: string;
  birthdate?: string;
  phoneNumber?: string;
  emailAddress?: string;
  checks: VerificationCheck[];
}

export interface VerificationCheck {
  name: string;
  status: string;
  reasons: string[];
  metadata: any;
}

export interface VerificationRelationships {
  inquiry: { data?: VerificationReference };
}

// this interface has a 'type' like account, inquiry, etc, and an 'id'...
export interface VerificationReference {
  type?: string;
  id?: string;
}

import { isEmpty } from '../'

export class VerificationApi {
  client: Persona
  database: DatabaseApi

  constructor(client: Persona, options?: PersonaOptions) {
    this.client = client
    // now construct all the specific domain objects
    this.database = new DatabaseApi(this.client, options)
  }

  /*
   * Function to take a 'verificationId' for a Verification that should
   * already exist in the system, and return that, if it exists.
   */
  async byId(verificationId: string): Promise<{
    success: boolean,
    verification?: Verification,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'GET',
      `verifications/${verificationId}`,
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
   * Function to take a 'verificationId' for a Verification and "print" it
   * as a PDF and return it in the 'body' of the response to this call.
   * This will be a Gunzip buffer of the contents of the PDF image, and so
   * it can be written, or displayed, as needed.
   */
  async print(verificationId: string): Promise<{
    success: boolean,
    verification?: {
      id?: string,
      body?: string,
    },
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'GET',
      `verifications/${verificationId}/print`,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.errors)) {
      return {
        success: false,
        error: { type: 'persona', causes: resp?.payload?.errors },
        details: resp?.details,
      }
    }
    // build up the verification from the PDF data and the id we received
    const verification = {
      id: verificationId,
      body: resp.response?.body,
    }
    return { success: true, verification }
  }
}
