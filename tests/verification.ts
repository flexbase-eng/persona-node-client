import { Persona } from '../src/index'

(async () => {
  const client = new Persona(process.env.PERSONA_API_KEY!)

  const TEMPLATE_ID = 'tmpl_PPDFW92MxhJLomjh4gC2tb5x'

  const refId = '7f2ca97f-a110-4f2d-b00e-0d648857db69'

  console.log('creating new Inquiry based off Database Template...')
  const one = await client.inquiry.create({
    templateId: TEMPLATE_ID,
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
  // console.log('TWO', two)
  const verificationId = two?.verification?.id!
  if (two.success) {
    console.log(`Success! ran the Database Verification ${verificationId} : '${two.verification?.status}'`)
  } else {
    console.log('Error! Running Database Verification failed, and the output is:')
    console.log(two)
    console.log('ERROR', two?.error)
  }

})()
