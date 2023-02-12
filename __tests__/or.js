const {w2uiQuery} = require ('../lib/w2uiAdapter.js')

class Job {

	constructor (rq) {
	
		this.rq = rq
	
		this.db = {
		
			w2uiQuery,
		
			model: {
				
				createQuery: (from, options) => {
				
					const filters = []
								
					for (const [c, o, p] of from [0] [1].filters) {
					
						const f = {sql: c + ' ' + o}
						
						if (p) {
						
							f.sql += ' ' + '?'
							
							f.params = [p]
						
						}
						
						filters.push (f)
					
					}
				
					return {tables: [{filters}]}
					
				}
		
			}
		
		}
		
		this.db.job = this
	
	}

}

test ('or', () => {

	const q = new Job ({
		limit: 50,
		offset: 0,
		searchLogic: 'OR',
		search: [
			{field: 'id', operator: 'is', value: 1},
			{field: 'id', operator: 'is', value: null},
		]
	}).db.w2uiQuery ([['users']])
	
	expect (q.tables [0].filters [0].sql).toBe ('((id = ?) OR (id IS NULL))')
	expect (q.tables [0].filters [0].params).toStrictEqual ([1])

})