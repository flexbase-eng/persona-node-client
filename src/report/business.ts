import type {
  Persona,
  PersonaOptions,
  PersonaError,
  PersonaCallDetails,
  PersonaIncluded,
} from '../'
import type { Report } from './'

export class BusinessApi {
  client: Persona
  adverseMediaTemplateId?: string
  watchlistTemplateId?: string
  lookupTemplateId?: string

  constructor(client: Persona, options?: PersonaOptions) {
    this.client = client
    // now pick off any report templates in the options
    this.adverseMediaTemplateId = options?.businessReports?.adverseMediaTemplateId
    this.watchlistTemplateId = options?.businessReports?.watchlistTemplateId
    this.lookupTemplateId = options?.businessReports?.lookupTemplateId
  }

  /*
   * Function to take a Company Name and submit it to Persona's
   * Business Adverse Media Report engine and get back the data needed
   * to retrieve it when it is complete. If the optional 'synchronous'
   * argument is 'true', then this will wait for the report to be
   * complete before returning.
   */
  async adverseMedia(data: {
    name: string,
    referenceId?: string,
    reportTemplateId?: string;
    synchronous?: boolean,
  }): Promise<{
    success: boolean,
    stage?: string,
    report?: Report,
    error?: PersonaError,
    details?: PersonaCallDetails,
    included?: PersonaIncluded,
  }> {
    return await this.client.report.run(
      {
        data: {
          attributes: {
            reportTemplateId: data.reportTemplateId ?? this.adverseMediaTemplateId,
            referenceId: data.referenceId,
            term: data.name,
          }
        }
      },
      data.synchronous
    )
  }

  /*
   * Function to take a Company Name and submit it to Persona's
   * Business Watchlist Report engine and get back the data needed
   * to retrieve it when it is complete. If the optional 'synchronous'
   * argument is 'true', then this will wait for the report to be
   * complete before returning.
   */
  async watchlist(data: {
    name: string,
    referenceId?: string,
    reportTemplateId?: string;
    synchronous?: boolean,
  }): Promise<{
    success: boolean,
    stage?: string,
    report?: Report,
    error?: PersonaError,
    details?: PersonaCallDetails,
    included?: PersonaIncluded,
  }> {
    return await this.client.report.run(
      {
        data: {
          attributes: {
            report_template_id: data.reportTemplateId ?? this.watchlistTemplateId,
            reference_id: data.referenceId,
            term: data.name,
          }
        }
      },
      data.synchronous
    )
  }

  /*
   * Function to take a Company Name and submit it to Persona's
   * Business Watchlist Report engine and get back the data needed
   * to retrieve it when it is complete. If the optional 'synchronous'
   * argument is 'true', then this will wait for the report to be
   * complete before returning.
   */
  async lookup(data: {
    businessName: string,
    referenceId?: string,
    addressStreet1?: string,
    addressStreet2?: string,
    addressCity: string,
    addressSubdivision: string,
    addressPostalCode?: string,
    associatedPeople?: {
      nameFirst?: string,
      nameLast?: string,
    }[],
    reportTemplateId?: string;
    synchronous?: boolean,
  }): Promise<{
    success: boolean,
    stage?: string,
    report?: Report,
    error?: PersonaError,
    details?: PersonaCallDetails,
    included?: PersonaIncluded,
  }> {
    const { reportTemplateId, synchronous, ...query } = data
    return await this.client.report.run(
      {
        data: {
          attributes: {
            report_template_id: reportTemplateId ?? this.lookupTemplateId,
            query,
          }
        }
      },
      synchronous
    )
  }
}
