import type { Persona, PersonaOptions, PersonaError, PersonaCallDetails } from './'

export interface Account {
  id?: string;
  referenceId?: string;
  nameFirst?: string;
  nameMiddle?: string;
  nameLast?: string;
  nameSuffix?: string;
  birthdate?: string;
  birthplace?: string;
  sex?: string;
  addressStreet1?: string;
  addressStreet2?: string;
  addressCity?: string;
  addressSubdivision?: string;
  addressPostalCode?: string;
  countryCode?: string;
  emailAddress?: string;
  phoneNumber?: string;
  socialSecurityNumber?: string;
  driverLicenseNumber?: string;
  expirationDate?: string;
  tags?: string[];
  selfiePhoto?: {
    data: {
      data: string;
      filename: string;
    }
  };
  createdAt?: string;
  updatedAt?: string;
}

import { mkHeaders, isEmpty } from './'

export class AccountApi {
  client: Persona;

  constructor(client: Persona, _options?: PersonaOptions) {
    this.client = client
  }

  /*
   * Function to take some standard Persona paging parameters and return a
   * list of all the 'Accounts' in Persona for your organization. This has
   * the nice filtering feature, so if you take advantage of the 'referenceId'
   * in creating the Accounts, you can look them up by that.
   */
  async list(options?: {
    beforeId?: string,
    afterId?: string,
    size?: string,
    filterRefId?: string,
  }): Promise<{
    success: boolean,
    accounts?: Account[],
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'GET',
      'accounts',
      mkHeaders(options),
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.error)) {
      return {
        success: false,
        error: { type: 'persona', causes: resp?.payload?.errors },
        details: resp?.details,
      }
    }
    // build up the list so that it makes a little more sense to the caller
    const accounts = resp?.payload?.data.map((elem: any) => {
      return { ...elem.attributes, id: elem.id }
    })
    return { success: true, accounts, details: resp?.details }
  }

  /*
   * Function to take an 'accountId' for an Account that should already
   * exist in the system, and return that Account, if it exists.
   */
  async byId(accountId: string): Promise<{
    success: boolean,
    account?: Account,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'GET',
      `accounts/${accountId}`,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.errors)) {
      return {
        success: false,
        error: { type: 'persona', causes: resp?.payload?.errors },
        details: resp?.details,
      }
    }
    // build up the account from the data into, and out of, Persona
    const account = {
      ...resp?.payload?.data?.attributes,
      id: resp?.payload?.data?.id,
    }
    return { success: true, account, details: resp?.details }
  }

  /*
   * Function to create a new Account based on the provided data. This will
   * be the person, or identity, that can later be the subject of an Inquiry,
   * and so will be later referenced by it's 'accountId'.
   */
  async create(data: Partial<Account>, options?: {
    idempotencyKey?: string,
  }): Promise<{
    success: boolean,
    account?: Account,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'POST',
      'accounts',
      mkHeaders(options),
      undefined,
      { data: { attributes: { ...data } } },
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.errors)) {
      return {
        success: false,
        error: { type: 'persona', causes: resp?.payload?.errors },
        details: resp?.details,
      }
    }
    // build up the account from the data into, and out of, Persona
    const account = {
      ...data,
      ...resp?.payload?.data?.attributes,
      id: resp?.payload?.data?.id,
    }
    return { success: true, account, details: resp?.details }
  }

  /*
   * Function to soft-delete an Account based on the provided 'accountId'.
   * Persona describes this as:
   *
   *   Permanently deletes personally identifiable information (PII) for
   *   an Account and all associated Inquiries, Verifications and Reports.
   *   This action cannot be undone.
   *
   *   This endpoint can be used to comply with privacy regulations such
   *   as GDPR / CCPA or to enforce data privacy.
   *
   *   Note: An account is still updatable after redaction. If you want
   *   to delete data continuously, please reach out to us to help you
   *   setup a retention policy.
   *
   * So they say it's 'deleted', but it's still updateable, and so it
   * means the referenceId is still in play, and cannot be reused.
   */
  async delete(accountId: string): Promise<{
    success: boolean,
    account?: Account,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'DELETE',
      `accounts/${accountId}`,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.errors)) {
      return {
        success: false,
        error: { type: 'persona', causes: resp?.payload?.errors },
        details: resp?.details,
      }
    }
    // build up the account from the data into, and out of, Persona
    const account = {
      ...resp?.payload?.data?.attributes,
      id: resp?.payload?.data?.id,
    }
    return { success: true, account, details: resp?.details }
  }

  /*
   * Function to take an accountId and an Account object, in part, or
   * whole, and updates the Account at Persona with this information.
   * The return value will be the updated Account. It's important to
   * note that you can update a 'deleted' account as it's only been
   * soft-deleted.
   */
  async update(accountId: string, data: Partial<Account>, options?: {
    idempotencyKey?: string,
  }): Promise<{
    success: boolean,
    account?: Account,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'PATCH',
      `accounts/${accountId}`,
      mkHeaders(options),
      undefined,
      { data: { attributes: { ...data } } },
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.errors)) {
      return {
        success: false,
        error: { type: 'persona', causes: resp?.payload?.errors },
        details: resp?.details,
      }
    }
    // build up the account from the data into, and out of, Persona
    const account = {
      ...resp?.payload?.data?.attributes,
      id: resp?.payload?.data?.id,
    }
    return { success: true, account, details: resp?.details }
  }

  /*
   * Function to take an accountId and a string that will be a tag for this
   * account in Persona, and add that tag. The return value will be the
   * updated Account. It's important to note that you can update a 'deleted'
   * account as it's only been soft-deleted - and that's true for updating
   * tags as well.
   */
  async addTag(accountId: string, tag: string, options?: {
    idempotencyKey?: string,
  }): Promise<{
    success: boolean,
    account?: Account,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'POST',
      `accounts/${accountId}/add-tag`,
      mkHeaders(options),
      undefined,
      { meta: { tagName: tag } },
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.errors)) {
      return {
        success: false,
        error: { type: 'persona', causes: resp?.payload?.errors },
        details: resp?.details,
      }
    }
    // build up the account from the data into, and out of, Persona
    const account = {
      ...resp?.payload?.data?.attributes,
      id: resp?.payload?.data?.id,
    }
    return { success: true, account, details: resp?.details }
  }

  /*
   * Function to take an accountId and a string that is a tag on this
   * account in Persona, and drop that tag. The return value will be the
   * updated Account. It's important to note that you can update a
   * 'deleted' account as it's only been soft-deleted - and that's true
   * for updating tags as well.
   */
  async removeTag(accountId: string, tag: string, options?: {
    idempotencyKey?: string,
  }): Promise<{
    success: boolean,
    account?: Account,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'POST',
      `accounts/${accountId}/remove-tag`,
      mkHeaders(options),
      undefined,
      { meta: { tagName: tag } },
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.errors)) {
      return {
        success: false,
        error: { type: 'persona', causes: resp?.payload?.errors },
        details: resp?.details,
      }
    }
    // build up the account from the data into, and out of, Persona
    const account = {
      ...resp?.payload?.data?.attributes,
      id: resp?.payload?.data?.id,
    }
    return { success: true, account, details: resp?.details }
  }

  /*
   * Function to take an accountId and an array of strings that will be a
   * set of tags to set on this account in Persona, replacing all other tags.
   * The return value will be the updated Account. It's important to note
   * that you can update a 'deleted' account as it's only been soft-deleted -
   * and that's true for updating tags as well.
   */
  async setTags(accountId: string, tags: string[], options?: {
    idempotencyKey?: string,
  }): Promise<{
    success: boolean,
    account?: Account,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'POST',
      `accounts/${accountId}/set-tags`,
      mkHeaders(options),
      undefined,
      { meta: { tagName: tags } },
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.errors)) {
      return {
        success: false,
        error: { type: 'persona', causes: resp?.payload?.errors },
        details: resp?.details,
      }
    }
    // build up the account from the data into, and out of, Persona
    const account = {
      ...resp?.payload?.data?.attributes,
      id: resp?.payload?.data?.id,
    }
    return { success: true, account, details: resp?.details }
  }

  /*
   * Function to take a 'destination' accountId and an array of accountId
   * strings to consolidate their Inquiry, Verification, and Reports onto.
   * As Persona puts it:
   *
   *   Consolidates several source Accounts' information into one target
   *   Account. Any Inquiry, Verification, Report and Document associated
   *   with the source Account will be transferred over to the destination
   *   Account. However, the Account's attributes will not be transferred.
   *   After consolidation, you can update the destination Account's
   *   attributes using the Account update endpoint.
   *
   *   This endpoint can be used to clean up duplicate Accounts.
   *
   *   Note: A source account can only be consolidated once. Afterwards,
   *   the source account will be archived.
   */
  async consolidate(accountId: string, ids: string[], options?: {
    idempotencyKey?: string,
  }): Promise<{
    success: boolean,
    account?: Account,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'POST',
      `accounts/${accountId}/consolidate`,
      mkHeaders(options),
      undefined,
      { meta: { sourceAccountIds: ids } },
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.errors)) {
      return {
        success: false,
        error: { type: 'persona', causes: resp?.payload?.errors },
        details: resp?.details,
      }
    }
    // build up the account from the data into, and out of, Persona
    const account = {
      ...resp?.payload?.data?.attributes,
      id: resp?.payload?.data?.id,
    }
    return { success: true, account, details: resp?.details }
  }
}
