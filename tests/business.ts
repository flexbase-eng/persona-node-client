import { Persona } from '../src/index'

(async () => {
  const client = new Persona(process.env.PERSONA_API_KEY!)

  console.log('getting Business Watchlist Report...')
  const one = await client.report.business.watchlist({ name: 'Microsoft' })
  // console.log('ONE', one)
  if (one.success) {
    console.log('Success! We got the Business watchlist Report')
  } else {
    console.log('Error! Business Watchlist Report failed, and the output is:')
    console.log(one)
    console.log('ERROR', one?.error)
  }

  console.log('getting Business Watchlist Report - synchronously...')
  const two = await client.report.business.watchlist({ name: 'Microsoft', synchronous: true })
  // console.log('two', two)
  if (two.success) {
    console.log('Success! We got the Business watchlist Report')
  } else {
    console.log('Error! Business Watchlist Report failed, and the output is:')
    console.log(two)
    console.log('ERROR', two?.error)
  }

  console.log('getting Business Adverse Media Report - synchronously...')
  const tre = await client.report.business.adverseMedia({ name: 'Microsoft', synchronous: true })
  // console.log('TRE', tre)
  if (tre.success) {
    console.log('Success! We got the Business Adverse Media Report')
  } else {
    console.log('Error! Business Adverse Media Report failed, and the output is:')
    console.log(tre)
    console.log('ERROR', tre?.error)
  }

  console.log('getting Business Lookup Report - synchronously...')
  const fou = await client.report.business.lookup({
    businessName: 'Palantir Technologies',
    addressCity: 'Palo Alto',
    addressSubdivision: 'CA',
    synchronous: true,
  })
  // console.log('FOU', fou)
  if (fou.success) {
    console.log('Success! We got the Business Lookup Report')
  } else {
    console.log('Error! Business Lookup Report failed, and the output is:')
    console.log(fou)
    console.log('ERROR', fou?.error)
  }
})()
