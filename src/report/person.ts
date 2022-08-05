import type {
  Persona,
  PersonaOptions,
  PersonaError,
  PersonaCallDetails,
  PersonaIncluded,
} from '../'
import type { Report } from './'

export class PersonApi {
  client: Persona
  adverseMediaTemplateId?: string
  watchlistTemplateId?: string
  pepTemplateId?: string

  constructor(client: Persona, options?: PersonaOptions) {
    this.client = client
    // now extract the report template ids from the options
    this.adverseMediaTemplateId = options?.personReports?.adverseMediaTemplateId
    this.watchlistTemplateId = options?.personReports?.watchlistTemplateId
    this.pepTemplateId = options?.personReports?.pepTemplateId
  }

  /*
   * Function to take a Person's Name and Birthdate and submit it to
   * Persona's Person Adverse Media Report engine and get back the data
   * needed to retrieve it when it is complete. If the optional
   * 'synchronous' argument is 'true', then this will wait for the
   * report to be complete before returning.
   */
  async adverseMedia(data: {
    nameFirst: string,
    nameLast: string,
    birthdate?: string,
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
          attributes: { ...query,
            reportTemplateId: reportTemplateId ?? this.adverseMediaTemplateId,
          }
        }
      },
      synchronous
    )
  }

  /*
   * Function to take a Person's Name and Birthdate and submit it to
   * Persona's Person Watchlist Report engine and get back the data needed
   * to retrieve it when it is complete. If the optional 'synchronous'
   * argument is 'true', then this will wait for the report to be
   * complete before returning.
   */
  async watchlist(data: {
    nameFirst: string,
    nameLast: string,
    birthdate?: string,
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
          attributes: { ...query,
            reportTemplateId: reportTemplateId ?? this.watchlistTemplateId,
          }
        }
      },
      synchronous
    )
  }

  /*
   * Function to take a Person's Name and Birthdate and submit it to
   * Persona's Person PEP Report engine and get back the data needed
   * to retrieve it when it is complete. If the optional 'synchronous'
   * argument is 'true', then this will wait for the report to be
   * complete before returning.
   */
  async pep(data: {
    term: string,
    birthdate?: string,
    countryCode?: string,
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
            reportTemplateId: reportTemplateId ?? this.pepTemplateId,
            query,
          }
        }
      },
      synchronous
    )
  }
}
