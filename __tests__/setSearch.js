const {setSearch} = require ('../lib/w2uiAdapter.js')

test ('1', () => {

	const from = [['users']]

	setSearch (from, [{field: 'id', operator: 'is', type: 'int', value: 1}])

	expect (from).toStrictEqual ([
		['users', {filters: [['id', '=', 1]]}],
	])
	
})

