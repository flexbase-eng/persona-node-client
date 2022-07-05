import { Persona } from '../src/index'


describe('persona account endpoints tests', () =>{
  test('end to end test for account endpoints', async() => {
    const client = new Persona(process.env.PERSONA_API_KEY!)

    console.log('getting List of Accounts...')
    const one = await client.account.list()
    if (one.success) {
      console.log(`Success! There are now ${one.accounts!.length} accounts`)
    } else {
      console.log('Error! Listing Accounts failed, and the output is:')
      console.log(one)
      console.log('ERROR', one?.error)
    }
  
    console.log('getting a single Account... (this should be an error)')
    const twoA = await client.account.byId('abc_123')
    if (twoA.success) {
      console.log('Error! There should be no account for a fake accountId!')
      console.log(twoA)
      console.log('ERROR', twoA?.error)
    } else {
      console.log('Success! Getting a goofy Account by Id failed, as it should.')
    }
  
    console.log('getting a single Account...')
    const twoBAcctId = 'act_GSzquZ2gyBXsJ9yKB7HJuhW7'
    const twoB = await client.account.byId(twoBAcctId)
    if (twoB.success) {
      console.log(`Success! We found the accountId ${twoBAcctId}`)
    } else {
      console.log(`Error! We cannot find the accountId: ${twoBAcctId}.`)
      console.log(twoB)
      console.log('ERROR', twoB?.error)
    }
  
    console.log('creating a new Account...')
    const jacobRefId = '7ab50553-67ee-4b59-9adb-dbce7f37af0a'
    const jacob = {
      referenceId: jacobRefId,
      nameFirst: 'Jacob',
      nameLast: 'Woods',
      birthdate: '1998-01-11',
      addressStreet1: '8601 Sugarlimb Ave',
      addressCity: 'Loudon',
      addressSubdivision: 'TN',
      addressPostalCode: '37774',
      countryCode: 'US',
      emailAddress: 'jwoods@gmail.com',
      phoneNumber: '680-206-6197',
      socialSecurityNumber: '111-22-3333',
      tags: ['bad-actor', 'trouble'],
    }
    const tre = await client.account.create(jacob)
    if (tre.success) {
      console.log(`Success! ${tre.account!.nameFirst} was created at ${tre.account!.createdAt}`)
    } else {
      console.log(`Error! Creating Account for ${jacob.nameFirst} failed, and the output is:`)
      console.log(tre)
      console.log('ERROR', tre?.error)
    }
  
    if (tre.success) {
      console.log('getting the single Account we just made...')
      const hit = await client.account.byId(tre.account!.id!)
      if (hit.success) {
        console.log(`Success! We found the accountId ${tre.account!.id} for ${hit.account!.nameFirst}`)
      } else {
        console.log(`Error! We cannot find the accountId: ${tre.account!.id}.`)
        console.log(hit)
        console.log('ERROR', hit?.error)
      }
    }
  
    console.log('redacting a single Account...')
    const fouAcctId = 'act_e9ZNggooRhGywARBeRLo2e4Q'
    const fou = await client.account.delete(fouAcctId)
    if (fou.success) {
      console.log(`Success! We deleted the accountId ${fouAcctId}`)
    } else {
      console.log(`Error! We cannot delete the accountId: ${fouAcctId}.`)
      console.log(fou)
      console.log('ERROR', fou?.error)
    }
  
    console.log('getting List of Accounts...')
    const fiv = await client.account.list()
    if (fiv.success) {
      console.log(`Success! There are now ${fiv.accounts!.length} accounts`)
    } else {
      console.log('Error! Listing Accounts failed, and the output is:')
      console.log(fiv)
      console.log('ERROR', fiv?.error)
    }
  
    console.log('updating a single Account...')
    const sixAcctId = 'act_GSzquZ2gyBXsJ9yKB7HJuhW7'
    const six = await client.account.update(sixAcctId, {
      emailAddress: 'yumyum@google.com',
    })
    if (six.success) {
      console.log(`Success! We updated the accountId ${sixAcctId}`)
    } else {
      console.log(`Error! We cannot update the accountId: ${sixAcctId}.`)
      console.log(six)
      console.log('ERROR', six?.error)
    }
  
    console.log('adding a tag to an existing Account...')
    const sevAcctId = 'act_GSzquZ2gyBXsJ9yKB7HJuhW7'
    const sev = await client.account.addTag(sevAcctId, 'grandma')
    if (sev.success) {
      console.log(`Success! We added the tag to the accountId ${sevAcctId}`)
    } else {
      console.log(`Error! We cannot add the tag to the accountId: ${sevAcctId}.`)
      console.log(sev)
      console.log('ERROR', sev?.error)
    }
  
    console.log('removing a tag from an existing Account...')
    const eigAcctId = 'act_GSzquZ2gyBXsJ9yKB7HJuhW7'
    const eigA = await client.account.removeTag(eigAcctId, 'grandma')
    if (eigA.success) {
      console.log(`Success! We removed the tag from the accountId ${eigAcctId}`)
    } else {
      console.log(`Error! We cannot remove the tag from the accountId: ${eigAcctId}.`)
      console.log(eigA)
      console.log('ERROR', eigA?.error)
    }
  
    console.log('removing a non-existent tag from an existing Account...')
    const eigB = await client.account.removeTag(eigAcctId, 'tricky')
    if (eigB.success) {
      console.log(`Error! We should not be able to remove the non-existent tag from the accountId: ${eigAcctId}.`)
      console.log(eigB)
      console.log('ERROR', eigB?.error)
    } else {
      console.log(`Success! We were not able to remove the non-existent tag from the accountId ${eigAcctId}`)
    }
  
    console.log('setting all tags on an existing Account...')
    const ninAcctId = 'act_GSzquZ2gyBXsJ9yKB7HJuhW7'
    const nin = await client.account.setTags(ninAcctId, ['grandma', 'tricky'])
    if (nin.success) {
      console.log(`Success! We set the tags on the accountId ${ninAcctId}`)
    } else {
      console.log(`Error! We cannot set the tags on the accountId: ${ninAcctId}.`)
      console.log(nin)
      console.log('ERROR', nin?.error)
    }
  
    console.log('consolidating accounts on an existing Account...')
    const tenAcctId = 'act_GSzquZ2gyBXsJ9yKB7HJuhW7'
    const ten = await client.account.consolidate(tenAcctId, [tenAcctId])
    if (ten.success) {
      console.log(`Success! We consolidated the accounts on the accountId ${tenAcctId}`)
    } else {
      console.log(`Error! We cannot consolidate the accounts on the accountId: ${tenAcctId}.`)
      console.log(ten)
      console.log('ERROR', ten?.error)
    }
  })
})
