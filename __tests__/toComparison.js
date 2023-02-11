const {toComparison} = require ('../lib/w2uiAdapter.js')

test ('dtISO', () => {

	expect (toComparison ({field: 'id', operator: 'is', value: null}))
		.toStrictEqual (['id', 'IS NULL'])

	expect (toComparison ({field: 'id', operator: 'is not', value: null}))
		.toStrictEqual (['id', 'IS NOT NULL'])

	expect (toComparison ({field: 'id', operator: 'is', value: 1}))
		.toStrictEqual (['id', '=', 1])

	expect (toComparison ({field: 'id', operator: 'in', value: [1, 2]}))
		.toStrictEqual (['id', 'IN', [1, 2]])

	expect (toComparison ({field: 'label', operator: 'begins', value: 'pre'}))
		.toStrictEqual (['label', 'ILIKE', 'pre%'])

	expect (toComparison ({field: 'label', operator: 'ends', value: 'post'}))
		.toStrictEqual (['label', 'ILIKE', '%post'])

	expect (toComparison ({field: 'label', operator: 'contains', value: 'mid'}))
		.toStrictEqual (['label', 'ILIKE', '%mid%'])

	expect (() => toComparison ({field: 'label', operator: "Hamilton's", value: 1}))
		.toThrow ()

	expect (() => toComparison ({field: 'label', operator: "Hamilton's", value: null}))
		.toThrow ()
	
})