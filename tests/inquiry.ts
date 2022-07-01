import { v4 as uuidv4 } from 'uuid'
import { Persona } from '../src/index'

(async () => {
  const client = new Persona(process.env.PERSONA_API_KEY!)

  console.log('getting List of Inquiries...')
  const one = await client.inquiry.list()
  // console.log('ONE', one)
  if (one.success) {
    console.log(`Success! There are now ${one.inquiries!.length} inquiries`)
  } else {
    console.log('Error! Listing Inquiries failed, and the output is:')
    console.log(one)
    console.log('ERROR', one?.error)
  }

  console.log('getting one Inquiry by id...')
  const twoId = 'inq_hckCfzvWeT3YEkkmVGzAuxKn'
  const two = await client.inquiry.byId(twoId)
  // console.log('TWO', two)
  if (two.success) {
    console.log(`Success! found the Inquiry for ${twoId}`)
  } else {
    console.log('Error! Getting Inquiry failed, and the output is:')
    console.log(two)
    console.log('ERROR', two?.error)
  }

  console.log('printing an Inquiry by id...')
  const treId = 'inq_hckCfzvWeT3YEkkmVGzAuxKn'
  const tre = await client.inquiry.print(treId)
  // console.log('TRE', tre)
  if (tre.success) {
    console.log(`Success! printed the Inquiry for ${treId}`)
  } else {
    console.log('Error! Printing Inquiry failed, and the output is:')
    console.log(tre)
    console.log('ERROR', tre?.error)
  }

})()
