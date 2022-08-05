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

  constructor(client: Persona, _options?: PersonaOptions) {
    this.client = client
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
          attributes: { ...query,
            report_template_id: 'rptp_g8uZZ6A9cLL6A7UBbDunJGv3',
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
          attributes: { ...query,
            reportTemplateId: 'rptp_wMAMFndffU578nMxAqMpJx2T',
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
            reportTemplateId: 'rptp_JcTanFNdJKrMzwQbWaywVLRy',
            query,
          }
        }
      },
      synchronous
    )
  }
}
