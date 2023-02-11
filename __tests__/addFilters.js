const {addFilters} = require ('../lib/w2uiAdapter.js')

test ('eq', () => {

	const a = []

	addFilters (a, {field: 'id', operator: 'is', type: 'int', value: 1})

	expect (a).toStrictEqual ([
		['id', '=', 1],
	])
	
})

test ('both', () => {

	const a = []

	addFilters (a, {field: 'id', operator: 'between', type: 'int', value: [1, 10]})

	expect (a).toStrictEqual ([
		['id', '>=', 1],
		['id', '<=', 10],
	])
	
})

test ('from', () => {

	const a = []

	addFilters (a, {field: 'id', operator: 'between', type: 'int', value: [1, '']})

	expect (a).toStrictEqual ([
		['id', '>=', 1],
	])
	
})

test ('to', () => {

	const a = []

	addFilters (a, {field: 'id', operator: 'between', type: 'int', value: ['', 10]})

	expect (a).toStrictEqual ([
		['id', '<=', 10],
	])
	
})

test ('date', () => {

	const a = []

	addFilters (a, {field: 'dt', operator: 'between', type: 'date', value: ['01.02.2005', '31.12.2005']})

	expect (a).toStrictEqual ([
		['dt', '>=', '2005-02-01'],
		['dt', '<',  '2006-01-01'],
	])
	
})
