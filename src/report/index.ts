import type {
  Persona,
  PersonaOptions,
  PersonaError,
  PersonaCallDetails,
  PersonaIncluded,
} from '../'

import { BusinessApi } from './business'
import { PersonApi } from './person'

export interface Report {
  type?: string;
  id?: string;
  attributes?: ReportAttributes;
  relationships?: ReportRelationships;
}

export interface ReportAttributes {
  status?: string;
  createdAt?: string;
  submittedAt?: string;
  redactedAt?: string;
  reportTemplateVersionName?: string;
  runHistory: ReportRun[];
  matchedLists?: any[];
  sanctionList: any[];
  fitnessProbityList: any[];
  warningList: any[];
  relatedSources: ReportRelatedSource[];
  query?: any;
  result?: ReportLookupResult;
  matchStatusBusinessName?: string;
  matchStatusAddressStreet?: string;
  matchStatusAddressCity?: string;
  matchStatusAddressPostalCode?: string;
  matchStatusPhoneNumber?: string;
  matchStatusEin?: string;
  matchStatusAssociatedPerson?: string;
  matchStatusWebsite?: string;
  nameFirst?: string;
  nameLast?: string;
  birthdateYear?: number;
  ignoreListMedia?: any;
  ignoreListEntry?: any[];
}

export interface ReportRelatedSource {
  name: string;
  akas: string[];
  matchTypes: string[];
  sources: ReportSource[];
  media: ReportMedia[];
  birthdates: string[];
}

export interface ReportSource {
  token: string;
  types: string[];
  name: string;
  countryCodes: string[];
}

export interface ReportMedia {
  url: string;
  date: string;
  title: string;
  snippet: string;
}

export interface ReportLookupResult {
  name: string;
  aliases?: string[];
  description?: string;
  legalStatus?: string;
  legalEntityType?: string;
  dateOfIncorporation?: {
    granularity?: string;
    day?: string;
    month?: string;
    year?: string;
  };
  industryClassification?: IndustryClassification[];
  identifiers?: ReportIdentifiers[];
  addresses?: ReportAddress[];
  websites?: string[];
  phoneNumbers?: string[];
  agents?: ReportPeople[];
  officers?: ReportPeople[];
  headcount?: number | string;
  sources?: any;
  birthdates?: string[];
  deathDates?: string[];
  matchTypes?: string[];
  country?: string;
  positions?: ReportPositions[];
}

export interface IndustryClassification {
  code?: number | string;
  title?: string;
  type?: string;
}

export interface ReportIdentifiers {
  state?: string;
  country?: string;
  issueDate?: string;
  fileNumber?: string;
  type?: string;
}

export interface ReportAddress {
  street1?: string;
  street2?: string;
  city?: string;
  subdivision?: string;
  postalCode?: string;
}

export interface ReportPeople {
  nameFull?: string;
  nameFirst?: string;
  nameLast?: string;
  titles?: string[];
}

export interface ReportPositions {
  pepClass?: string;
  sourceKey?: string;
  name?: string;
}

export interface ReportRun {
  scheduledAt?: string;
  completedAt?: string;
  reportTemplateVersionId?: number;
  type?: string;
}

export interface ReportRelationships {
  inquiry: { data?: ReportReference };
  account: { data?: ReportReference };
  reporttemplate: { data?: ReportReference };
}

import { setTimeout } from 'timers/promises'

// this interface has a 'type' like account, inquiry, etc, and an 'id'...
export interface ReportReference {
  type?: string;
  id?: string;
}

import { isEmpty } from '../'

export class ReportApi {
  client: Persona
  business: BusinessApi
  person: PersonApi

  constructor(client: Persona, options?: PersonaOptions) {
    this.client = client
    // now construct all the specific domain objects
    this.business = new BusinessApi(this.client, options)
    this.person = new PersonApi(this.client, options)
  }

  /*
   * Function to take a 'reportId' for a Report that should
   * already exist in the system, and return that, if it exists.
   */
  async byId(reportId: string): Promise<{
    success: boolean,
    report?: Report,
    error?: PersonaError,
    details?: PersonaCallDetails,
    included?: PersonaIncluded,
  }> {
    const resp = await this.client.fire(
      'GET',
      `reports/${reportId}`,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.errors)) {
      return {
        success: false,
        error: { type: 'persona', causes: resp?.payload?.errors },
        details: resp?.details,
      }
    }
    return {
      success: true,
      report: resp?.payload?.data,
      details: resp?.details,
      included: resp?.included,
    }
  }

  /*
   * Function to take a 'reportId' for a Report that is currently
   * processing in the system, and wait for it to complete, by looking
   * at the completedAt tag - it seems to be the most reliable.
   */
  async waitFor(reportId: string): Promise<{
    success: boolean,
    report?: Report,
    error?: PersonaError,
    details?: PersonaCallDetails,
    included?: PersonaIncluded,
  }> {
    // now wait a bit to get it - as we want to be synchronous on this
    let cnt = 0
    let chk: any
    while (cnt < 60) {
      // wait a bit, as we know Persona will take a few sec...
      await setTimeout(500)
      chk = await this.byId(reportId)
      if (chk?.success && chk?.report?.attributes?.completedAt) {
        return { ...chk }
      }
      cnt = cnt + 1
    }
    return {
      success: false,
      error: {
        type: 'client',
        causes: [
          {
            title: 'Timed out waiting for Report',
            details: 'After 30 sec, the Report never completed, and that may signify a greater issue',
          },
        ],
      },
    }
  }

  /*
   * Function to take the body of a Report Request, that has in it the
   * Report Template Id - telling Persona what it is that needs to be
   * done, and all the parameters that will be used in that search, and
   * the optional 'synchronous' flag, and will send this report request
   * to Persona, and, if necessary, wait for the report to be completed.
   */
  async run(body: object | object[], synchronous?: boolean): Promise<{
    success: boolean,
    stage?: string,
    report?: Report,
    error?: PersonaError,
    details?: PersonaCallDetails,
    included?: PersonaIncluded,
  }> {
    const resp = await this.client.fire('POST', 'reports', undefined, undefined, body)
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.errors)) {
      let ans = {
        success: false,
        error: { type: 'persona', causes: resp?.payload?.errors },
        details: resp?.details,
      } as any
      if (synchronous) {
        ans.stage = 'create'
      }
      return ans
    }
    // see is this is all they wanted
    const report = resp?.payload?.data
    if (!synchronous) {
      return { success: true, report, details: resp?.details }
    }

    // ...otherwise, wait for the results
    const reportId = report.id

    // now wait a bit to get it - as we want to be synchronous on this
    const chk = await this.waitFor(reportId)
    if (chk?.success) {
      return { ...chk, stage: 'complete' }
    }
    // if we are here, the verification process did not complete - flag it
    return { ...chk, stage: 'processing' }
  }
}
