import { Persona } from '../src/index'

(async () => {
  const client = new Persona(process.env.PERSONA_API_KEY!)

  const TEMPLATE_ID = 'tmpl_PPDFW92MxhJLomjh4gC2tb5x'

  const refId = '5f81c440-088a-4d71-8980-cdd2565abc8f'

  console.log('creating new Inquiry based off Database Template...')
  const one = await client.inquiry.create({
    templateId: TEMPLATE_ID,
    referenceId: refId,
  })
  console.log('ONE', one)
  const inquiryId = one?.inquiry?.id!
  if (one.success) {
    console.log(`Success! we have created the new Inquiry ${inquiryId}`)
  } else {
    console.log('Error! Failed to make the new Inquiry, and the output is:')
    console.log(one)
    console.log('ERROR', one?.error)
  }

  console.log(`creating Database Verification for Inquiry ${inquiryId}...`)
  const two = await client.verification.database.create({
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
  let verificationId = two?.verification?.id!
  if (two.success) {
    console.log(`Success! created the Database Verification ${verificationId}`)
  } else {
    console.log('Error! Creating Database Verification failed, and the output is:')
    console.log(two)
    console.log('ERROR', two?.error)
  }

  console.log(`submitting Verification Id ${verificationId}...`)
  const tre = await client.verification.database.submit(verificationId)
  console.log('TRE', tre)
  if (tre.success) {
    console.log(`Success! submitted the Verification ${verificationId}`)
  } else {
    console.log('Error! Submitting Verification failed, and the output is:')
    console.log(tre)
    console.log('ERROR', tre?.error)
  }

  console.log('getting the submitted Verification by id...')
  const fou = await client.verification.database.byId(verificationId)
  console.log('FOU', fou)
  if (fou.success) {
    console.log(`Success! fetched the Verification ${verificationId}`)
  } else {
    console.log('Error! Fetching Verification failed, and the output is:')
    console.log(fou)
    console.log('ERROR', fou?.error)
  }

  /*
   * Wait 8-10 sec - the typical time quoted by the Persona crew...
   */
  verificationId = 'ver_NhsMEqRLH76MixnvqbxjiZKu'
  console.log('getting the submitted Verification by id...')
  const fiv = await client.verification.database.byId(verificationId)
  console.log('FIV', fiv)
  if (fiv.success) {
    console.log(`Success! fetched the Verification ${verificationId}`)
  } else {
    console.log('Error! Fetching Verification failed, and the output is:')
    console.log(fiv)
    console.log('ERROR', fiv?.error)
  }

})()
