const {w2uiQuery} = require ('../lib/w2uiAdapter.js')

class Job {

	constructor (rq) {
	
		this.rq = rq
	
		this.db = {
		
			w2uiQuery,
		
			model: {
				
				createQuery: (from, options) => ({from, options})
		
			}
		
		}
		
		this.db.job = this
	
	}

}

test ('basic', () => {

	expect (new Job ({
			limit: 50,
			offset: 0,		
		}).db.w2uiQuery ([['users']])
	).toStrictEqual ({
		from: [['users']], 
		options: {offset: 0, limit: 50}
	})

})

test ('sort', () => {

	expect (new Job ({
			limit: 50,
			offset: 0,
			sort: [{field: 'label'}]
		}).db.w2uiQuery ([['users']])
	).toStrictEqual ({
		from: [['users']], 
		options: {offset: 0, limit: 50, order: [['label', false]]}
	})

})

test ('search', () => {

	expect (new Job ({
			limit: 50,
			offset: 0,
			search: [{field: 'label', operator: 'is', value: 'admin'}]
		}).db.w2uiQuery ([['users']])
	).toStrictEqual ({
		from: [['users', {filters: [['label', '=', 'admin']]}]], 
		options: {offset: 0, limit: 50}
	})

	expect (new Job ({
			limit: 50,
			offset: 0,
			search: [{field: 'label', operator: 'is', value: 'admin'}]
		}).db.w2uiQuery ([['users', {as: 'u'}]])
	).toStrictEqual ({
		from: [['users', {as: 'u', filters: [['label', '=', 'admin']]}]], 
		options: {offset: 0, limit: 50}
	})

	expect (new Job ({
			limit: 50,
			offset: 0,
			search: [{field: 'label', operator: 'is', value: 'admin'}]
		}).db.w2uiQuery ([['users', {as: 'u', filters: [['dt_fired', 'IS NULL']]}]])
	).toStrictEqual ({
		from: [['users', {as: 'u', filters: [['dt_fired', 'IS NULL'], ['label', '=', 'admin']]}]], 
		options: {offset: 0, limit: 50}
	})

})

