import { Persona } from '../src/index'

(async () => {
  const client = new Persona(process.env.PERSONA_API_KEY!, {
    personReports: {
      adverseMediaTemplateId: 'rptp_g8uZZ6A9cLL6A7UBbDunJGv3',
      watchlistTemplateId: 'rptp_wMAMFndffU578nMxAqMpJx2T',
      pepTemplateId: 'rptp_JcTanFNdJKrMzwQbWaywVLRy',
    }
  })

  console.log('getting Person Watchlist Report...')
  const one = await client.report.person.watchlist({
    nameFirst: 'Sherlock',
    nameLast: 'Holmes',
    birthdate: '1854-01-06',
    synchronous: true,
  })
  // console.log('ONE', one)
  if (one.success) {
    console.log('Success! We got the Person watchlist Report')
  } else {
    console.log('Error! Person Watchlist Report failed, and the output is:')
    console.log(one)
    console.log('ERROR', one?.error)
  }

  console.log('getting Person PEP Report...')
  const two = await client.report.person.pep({
    term: 'Boris Johnson',
    birthdate: '1964-06-19',
    synchronous: true,
  })
  // console.log('TWO', two)
  if (two.success) {
    console.log('Success! We got the Person PEP Report')
  } else {
    console.log('Error! Person PEP Report failed, and the output is:')
    console.log(two)
    console.log('ERROR', two?.error)
  }

  console.log('getting Person Adverse Media Report...')
  const tre = await client.report.person.adverseMedia({
    nameFirst: 'Sherlock',
    nameLast: 'Holmes',
    birthdate: '1854-01-06',
    synchronous: true,
  })
  // console.log('TRE', tre)
  if (tre.success) {
    console.log('Success! We got the Person Adverse Media Report')
  } else {
    console.log('Error! Person Adverse Media Report failed, and the output is:')
    console.log(tre)
    console.log('ERROR', tre?.error)
  }
})()
