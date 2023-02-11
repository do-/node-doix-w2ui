const {nextDay} = require ('../lib/w2uiAdapter.js')

test ('dtISO', () => {

	expect (nextDay ('2005-02-28')).toBe ('2005-03-01')

})