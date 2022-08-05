import { Persona } from '../src/index'

(async () => {
  const client = new Persona(process.env.PERSONA_API_KEY!, {
    verifications: {
      databaseTemplateId: 'tmpl_PPDFW92MxhJLomjh4gC2tb5x',
    }
  })

  const refId = '2eeada65-7f01-44d8-a868-33dd0bf445d9'

  console.log('creating new Inquiry based off Database Template...')
  const one = await client.inquiry.create({
    templateId: client.verification.database.databaseTemplateId,
    referenceId: refId,
  })
  // console.log('ONE', one)
  const inquiryId = one?.inquiry?.id!
  if (one.success) {
    console.log(`Success! we have created the new Inquiry ${inquiryId}`)
  } else {
    console.log('Error! Failed to make the new Inquiry, and the output is:')
    console.log(one)
    console.log('ERROR', one?.error)
  }

  console.log(`running Database Verification for Inquiry ${inquiryId}...`)
  const two = await client.verification.database.run({
    inquiryId,
    nameFirst: 'Tralisha',
    nameLast: 'Fenton',
    addressStreet1: '327 Briarbend Rd',
    addressCity: 'Goose Creek',
    addressSubdivision: 'SC',
    addressPostalCode: '29445-7778',
    identificationNumber: '311-68-1509',
    birthdate: '1998-01-11',
    phoneNumber: '903-991-3776',
    emailAddress: '3hwx94mq@smuggroup.com',
    countryCode: 'US',
  })
  console.log('TWO', two)
  const verificationId = two?.verification?.id!
  if (two.success) {
    console.log(`Success! ran the Database Verification ${verificationId} : '${two.verification?.attributes?.status}'`)
  } else {
    console.log('Error! Running Database Verification failed, and the output is:')
    console.log(two)
    console.log('ERROR', two?.error)
  }

  console.log(`getting Inquiry for Database Verification for ${refId}...`)
  const tre = await client.inquiry.list({ filterRefId: refId })
  console.log('TRE', tre.inquiries)
  console.log('TRE-TRE', tre.inquiries![0].relationships!.verifications)
  const vId = tre.inquiries![0].relationships!.verifications!.data![0].id!
  if (tre.success) {
    console.log(`Success! pulled the Database Verification for referenceId ${refId}`)
  } else {
    console.log('Error! Pulling Database Verification for referenceId, and the output is:')
    console.log(tre)
    console.log('ERROR', tre?.error)
  }

  const fou = await client.verification.byId(vId)
  console.log('FOU', fou)

})()
