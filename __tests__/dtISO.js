const {dtISO} = require ('../lib/w2uiAdapter.js')

test ('dtISO', () => {

	expect (dtISO ('2005-02-01')).toBe ('2005-02-01')
	expect (dtISO ('2005/02/01')).toBe ('2005-02-01')
	expect (dtISO ('01.02.2005')).toBe ('2005-02-01')
	expect (() => dtISO ('1.2.2005')).toThrow ()
	expect (() => dtISO (1)).toThrow ()

})