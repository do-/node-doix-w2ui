const {plugInto, w2uiQuery} = require ('../lib/w2uiAdapter.js')

test ('basic', () => {

	const pool = {shared: new Set ()}
	
	plugInto (pool)
	
	expect (pool.w2uiQuery).toBe (w2uiQuery)
	expect (pool.shared.has ('w2uiQuery')).toBe (true)

})

