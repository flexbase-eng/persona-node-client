import { Persona } from '../src/index'

(async () => {
  const client = new Persona(process.env.PERSONA_API_KEY!, {
    verifications: {
      tinTemplateId: 'vtmpl_gcbNYEjaVZTDZnLSQyK1THEX',
    }
  })

  let company = { nameBusiness: 'Microsoft Corp', tin: '91-1144442' }

  console.log(`creating Database TIN Verification for ${company.nameBusiness}...`)
  const one = await client.verification.tin.create({
    ...company,
    countryCode: 'US',
  })
  // console.log('ONE', one)
  if (one.success) {
    console.log(`Success! created the Database TIN Verification for ${company.nameBusiness}!`)
  } else {
    console.log('Error! Creating Database TIN Verification failed, and the output is:')
    console.log(one)
    console.log('ERROR', one?.error)
  }
  let verificationId = one?.verification?.id!

  console.log(`submitting Verification Id ${verificationId}...`)
  const two = await client.verification.tin.submit(verificationId)
  // console.log('TWO', two)
  if (two.success) {
    console.log(`Success! submitted the Verification ${verificationId}`)
  } else {
    console.log('Error! Submitting Verification failed, and the output is:')
    console.log(two)
    console.log('ERROR', two?.error)
  }

  console.log('getting the submitted Verification by id...')
  const tre = await client.verification.tin.byId(verificationId)
  // console.log('TRE', tre)
  if (tre.success) {
    console.log(`Success! fetched the Verification ${verificationId} - with the status: '${tre.verification?.attributes?.status}'`)
  } else {
    console.log('Error! Fetching Verification failed, and the output is:')
    console.log(tre)
    console.log('ERROR', tre?.error)
  }

  console.log(`running Database TIN Verification for ${company.nameBusiness}...`)
  const fou = await client.verification.tin.run({
    ...company,
    countryCode: 'US',
  })
  // console.log('FOU', fou)
  if (fou.success) {
    console.log(`Success! ran the Database TIN Verification for ${company.nameBusiness} : '${fou.verification?.attributes?.status}'`)
  } else {
    console.log('Error! Running Database TIN Verification failed, and the output is:')
    console.log(fou)
    console.log('ERROR', fou?.error)
  }

  company = { nameBusiness: 'Flexbase', tin: '41-1234567' }
  const fiv = await client.verification.tin.run({
    ...company,
    countryCode: 'US',
  })
  console.log('FIV', fiv)
  if (fiv.success) {
    console.log(`Success! ran the Database TIN Verification for ${company.nameBusiness} : '${fiv.verification?.attributes?.status}'`)
  } else {
    console.log('Error! Running Database TIN Verification failed, and the output is:')
    console.log(fiv)
    console.log('ERROR', fiv?.error)
  }

})()
