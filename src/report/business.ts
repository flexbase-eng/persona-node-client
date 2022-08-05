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

  constructor(client: Persona, _options?: PersonaOptions) {
    this.client = client
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
            report_template_id: 'rptp_Tnui8mpw2CmABBkrLsPi4YkV',
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
  async watchlist(data: {
    name: string,
    referenceId?: string,
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
            report_template_id: 'rptp_LsD1Y3SVhCbVD6bswergkUsC',
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
    synchronous?: boolean,
  }): Promise<{
    success: boolean,
    stage?: string,
    report?: Report,
    error?: PersonaError,
    details?: PersonaCallDetails,
    included?: PersonaIncluded,
  }> {
    const { synchronous, ...query } = data
    return await this.client.report.run(
      {
        data: {
          attributes: {
            report_template_id: 'rptp_bWqnhyyu18zP8BFR6N6bt8sL',
            query,
          }
        }
      },
      synchronous
    )
  }
}
