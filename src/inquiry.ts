import type { Persona, PersonaOptions, PersonaError, PersonaCallDetails } from './'

export interface Inquiry {
  id?: string;
  referenceId?: string;
  status?: string;
  note?: string;
  behaviors?: {
    requestSpoofAttempts?: string | number,
    userAgentSpoofAttempts?: string | number,
    distractionEvents?: string | number,
    hesitationBaseline?: string | number,
    hesitationCount?: string | number,
    hesitationTime?: string | number,
    shortcutCopies?: string | number,
    shortcutPastes?: string | number,
    autofillCancels?: string | number,
    autofillStarts?: string | number,
    devtoolsOpen?: string | number,
    completionTime?: string | number,
    hesitationPercentage?: string | number,
    behaviorThreatLevel?: string | number
  };
  tags?: string[];
  creator?: string;
  reviewerComment?: string;
  createdAt?: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  decisionedAt?: string;
  expiredAt?: string;
  redactedAt?: string;
  previousStepName?: string;
  nextStepName?: string;
  nameFirst?: string;
  nameMiddle?: string;
  nameLast?: string;
  birthdate?: string;
  addressStreet1?: string;
  addressStreet2?: string;
  addressCity?: string;
  addressSubdivision?: string;
  addressSubdivisionAbbr?: string;
  addressPostalCode?: string;
  addressPostalCodeAbbr?: string;
  addressCountryCode?: string;
  socialSecurityNumber?: string;
  emailAddress?: string;
  phoneNumber?: string;
  fields?: {
    birthdate?: InquiryField;
    nameFirst?: InquiryField;
    nameMiddle?: InquiryField;
    nameLast?: InquiryField;
    addressStreet1?: InquiryField;
    addressStreet2?: InquiryField;
    addressCity?: InquiryField;
    addressSubdivision?: InquiryField;
    addressPostalCode?: InquiryField;
    emailAddress?: InquiryField;
    phoneNumber?: InquiryField;
    addressCountryCode?: InquiryField;
    socialSecurityNumber?: InquiryField;
  };
}

export interface InquiryField {
  type?: string;
  value?: string | number;
}

import { mkHeaders, isEmpty, mkError } from './'

export class InquiryApi {
  client: Persona;

  constructor(client: Persona, _options?: PersonaOptions) {
    this.client = client
  }

  /*
   * Function to take some standard Persona paging parameters and return a
   * list of all the 'Inquiries' in Persona for your organization. This has
   * the nice filtering feature, so if you take advantage of the 'referenceId'
   * in creating the Inquiries, you can look them up by that.
   */
  async list(options?: {
    beforeId?: string,
    afterId?: string,
    size?: string,
    filterRefId?: string,
    filterAcctId?: string,
  }): Promise<{
    success: boolean,
    inquiries?: Inquiry[],
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'GET',
      'inquiries',
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
    const inquiries = resp?.payload?.data.map((elem: any) => {
      return { ...elem.attributes, id: elem.id }
    })
    return { success: true, inquiries, details: resp?.details }
  }

  /*
   * Function to take an 'inquiryId' for an Inquiry that should already
   * exist in the system, and return that Inquiry, if it exists.
   */
  async byId(inquiryId: string): Promise<{
    success: boolean,
    inquiry?: Inquiry,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'GET',
      `inquiries/${inquiryId}`,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.errors)) {
      return {
        success: false,
        error: { type: 'persona', causes: resp?.payload?.errors },
        details: resp?.details,
      }
    }
    // build up the inquiry from the data into, and out of, Persona
    const inquiry = {
      ...resp?.payload?.data?.attributes,
      id: resp?.payload?.data?.id,
    }
    return { success: true, inquiry, details: resp?.details }
  }

  /*
   * Function to take an 'inquiryId' for an Inquiry and "print" it as a PDF
   * and return it in the 'body' of the response to this call. This will be
   * a Gunzip buffer of the contents of the PDF image, and so it can be
   * written, or displayed, as needed.
   */
  async print(inquiryId: string): Promise<{
    success: boolean,
    inquiry?: {
      id?: string,
      body?: string,
    },
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'GET',
      `inquiries/${inquiryId}/print`,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.errors)) {
      return {
        success: false,
        error: { type: 'persona', causes: resp?.payload?.errors },
        details: resp?.details,
      }
    }
    // build up the inquiry from the PDF data and the id we received
    const inquiry = {
      id: inquiryId,
      body: resp.response?.body,
    }
    return { success: true, inquiry }
  }

  /*
   * Function to create a new Inquiry based on the provided data. This will
   * be the based on an Account (accountId), and then a Template (templateId)
   * to process the Account through those steps in the Template.
   */
  async create(data: {
    templateId?: string;
    inquiryTemplateId?: string;
    themeId?: string;
    accountId?: string;
    referenceId?: string;
    redirectUrl?: string;
    note?: string;
    countryCode?: string;
  }, options?: {
    idempotencyKey?: string,
  }): Promise<{
    success: boolean,
    inquiry?: Inquiry,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    // check the arguments to meke sure it won't clearly fail...
    if (!data.templateId && !data.inquiryTemplateId) {
      return {
        success: false,
        error: mkError('Persona requires that you send either a templateId, or an inquiryTemplateId, but not both, and you have supplied neither.'),
      }
    }
    if (data.templateId && data.inquiryTemplateId) {
      return {
        success: false,
        error: mkError('Persona requires that you send either a templateId, or an inquiryTemplateId, but not both, and you have supplied both.'),
      }
    }
    if (!data.accountId && !data.referenceId) {
      return {
        success: false,
        error: mkError('Persona requires that you send either an accountId, or a referenceId, but not both, and you have supplied neither.'),
      }
    }
    if (data.accountId && data.referenceId) {
      return {
        success: false,
        error: mkError('Persona requires that you send either an accountId, or a referenceId, but not both, and you have supplied both.'),
      }
    }

    // ...OK... we should be good to go now...
    const resp = await this.client.fire(
      'POST',
      'inquiries',
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
    // build up the inquiry from the data into, and out of, Persona
    const inquiry = {
      ...data,
      ...resp?.payload?.data?.attributes,
      id: resp?.payload?.data?.id,
    }
    return { success: true, inquiry, details: resp?.details }
  }

  /*
   * Function to take an inquiryId and a Partial Inquiry object, and
   * updates the Inquiry at Persona with this information.
   * The return value will be the updated Inquiry. It's important to
   * note that you can update a 'deleted' inquiry as it's only been
   * soft-deleted.
   */
  async update(inquiryId: string, data: Partial<Inquiry>): Promise<{
    success: boolean,
    inquiry?: Inquiry,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'PATCH',
      `inquiries/${inquiryId}`,
      undefined,
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
    // build up the inquiry from the data into, and out of, Persona
    const inquiry = {
      ...resp?.payload?.data?.attributes,
      id: resp?.payload?.data?.id,
    }
    return { success: true, inquiry, details: resp?.details }
  }

  /*
   * Function to take an inquiryId and to resume it's path through the
   * workflows. As Persona says:
   *
   *   Resumes an existing inquiry. If the inquiry is in a pending state,
   *   you must also specify a session token generated from this endpoint.
   */
  async resume(inquiryId: string, options?: {
    idempotencyKey?: string,
  }): Promise<{
    success: boolean,
    inquiry?: Inquiry,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'POST',
      `inquiries/${inquiryId}/resume`,
      mkHeaders(options),
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.errors)) {
      return {
        success: false,
        error: { type: 'persona', causes: resp?.payload?.errors },
        details: resp?.details,
      }
    }
    // build up the inquiry from the data into, and out of, Persona
    const inquiry = {
      ...resp?.payload?.data?.attributes,
      id: resp?.payload?.data?.id,
    }
    return { success: true, inquiry, details: resp?.details }
  }

  /*
   * Function to take an inquiryId and an optional comment and to mark it
   * as Approved so that it can finish it's workflow and webhooks.
   */
  async approve(inquiryId: string, comment?: string, options?: {
    idempotencyKey?: string,
  }): Promise<{
    success: boolean,
    inquiry?: Inquiry,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'POST',
      `inquiries/${inquiryId}/approve`,
      mkHeaders(options),
      undefined,
      { meta: { comment }},
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.errors)) {
      return {
        success: false,
        error: { type: 'persona', causes: resp?.payload?.errors },
        details: resp?.details,
      }
    }
    // build up the inquiry from the data into, and out of, Persona
    const inquiry = {
      ...resp?.payload?.data?.attributes,
      id: resp?.payload?.data?.id,
    }
    return { success: true, inquiry, details: resp?.details }
  }

  /*
   * Function to take an inquiryId and an optional comment and to mark it
   * as Declined so that it can finish it's workflow and webhooks.
   */
  async decline(inquiryId: string, comment?: string, options?: {
    idempotencyKey?: string,
  }): Promise<{
    success: boolean,
    inquiry?: Inquiry,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'POST',
      `inquiries/${inquiryId}/decline`,
      mkHeaders(options),
      undefined,
      { meta: { comment }},
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.errors)) {
      return {
        success: false,
        error: { type: 'persona', causes: resp?.payload?.errors },
        details: resp?.details,
      }
    }
    // build up the inquiry from the data into, and out of, Persona
    const inquiry = {
      ...resp?.payload?.data?.attributes,
      id: resp?.payload?.data?.id,
    }
    return { success: true, inquiry, details: resp?.details }
  }

  /*
   * Function to soft-delete an Inquiry based on the provided 'inquiryId'.
   * Persona describes this as:
   *
   *   Permanently deletes personally identifiable information (PII) for an
   *   Inquiry and all associated Verifications and Reports. This action
   *   cannot be undone.
   *
   *   This endpoint can be used to comply with privacy regulations such
   *   as GDPR / CCPA or to enforce data privacy.
   */
  async delete(inquiryId: string): Promise<{
    success: boolean,
    inquiry?: Inquiry,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'DELETE',
      `inquiries/${inquiryId}`,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.errors)) {
      return {
        success: false,
        error: { type: 'persona', causes: resp?.payload?.errors },
        details: resp?.details,
      }
    }
    // build up the inquiry from the data into, and out of, Persona
    const inquiry = {
      ...resp?.payload?.data?.attributes,
      id: resp?.payload?.data?.id,
    }
    return { success: true, inquiry, details: resp?.details }
  }

  /*
   * Function to take an inquiryId and a string that will be a tag for this
   * Inquiry in Persona, and add that tag. The return value will be the
   * updated Inquiry.
   */
  async addTag(inquiryId: string, tag: string, options?: {
    idempotencyKey?: string,
  }): Promise<{
    success: boolean,
    inquiry?: Inquiry,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'POST',
      `inquiries/${inquiryId}/add-tag`,
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
    // build up the inquiry from the data into, and out of, Persona
    const inquiry = {
      ...resp?.payload?.data?.attributes,
      id: resp?.payload?.data?.id,
    }
    return { success: true, inquiry, details: resp?.details }
  }

  /*
   * Function to take an inquiryId and a string that is a tag on this
   * Inquiry in Persona, and drop that tag. The return value will be the
   * updated Inquiry.
   */
  async removeTag(inquiryId: string, tag: string, options?: {
    idempotencyKey?: string,
  }): Promise<{
    success: boolean,
    inquiry?: Inquiry,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'POST',
      `inquiries/${inquiryId}/remove-tag`,
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
    // build up the inquiry from the data into, and out of, Persona
    const inquiry = {
      ...resp?.payload?.data?.attributes,
      id: resp?.payload?.data?.id,
    }
    return { success: true, inquiry, details: resp?.details }
  }

  /*
   * Function to take an inquiryId and an array of strings that will be a
   * set of tags to set on this Inquiry in Persona, replacing all other tags.
   * The return value will be the updated Inquiry.
   */
  async setTags(inquiryId: string, tags: string[], options?: {
    idempotencyKey?: string,
  }): Promise<{
    success: boolean,
    inquiry?: Inquiry,
    error?: PersonaError,
    details?: PersonaCallDetails,
  }> {
    const resp = await this.client.fire(
      'POST',
      `inquiries/${inquiryId}/set-tags`,
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
    // build up the inquiry from the data into, and out of, Persona
    const inquiry = {
      ...resp?.payload?.data?.attributes,
      id: resp?.payload?.data?.id,
    }
    return { success: true, inquiry, details: resp?.details }
  }
}
