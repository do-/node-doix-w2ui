const {DbQueryOr} = require ('doix-db')

const CH_MINUS = '-'.charCodeAt (0)
const RE_NOT_A_DIGIT = /\D/

const OP = new Map ([
	['is',       ['=' ,        0]],
	['is not',   ['<>',        0]],
	['less',     ['<=',        0]],
	['less!',    ['<',         0]],
	['more',     ['>=',        0]],
	['more!',    ['>',         0]],
	['in',       ['IN',        0]],
	['not in',   ['NOT IN',    0]],
	['begins',   ['ILIKE',     1]],
	['ends',     ['ILIKE',     2]],
	['contains', ['ILIKE',     3]],
	['misses',   ['NOT ILIKE', 3]],
])

const dtISO = s => {

	if (typeof s !== 'string') throw Error ('Not a string ' + s)

	if (s.charCodeAt (4) === CH_MINUS) return s

	if (s.length !== 10) throw Error ('Date string length must be 10, not ' + s.length)

	const parts	= s.split (RE_NOT_A_DIGIT)
	
	if (parts [0].length === 2) parts.reverse ()
	
	return parts.join ('-')

}

const nextDay = s => {

	const dt = new Date (s)

	dt.setDate (1 + dt.getDate ())

	return dt.toJSON ().slice (0, 10)

}

const toComparison = ({field, type, operator, value}) => {

	if (value === null) switch (operator) {
	
		case 'is': return [field, 'IS NULL']

		case 'is not': return [field, 'IS NOT NULL']

		default: throw Error ('null value is invalid for ' + operator + ' operator')

	}
	
	if (!OP.has (operator)) throw Error ('Unknown operator: ' + operator)
	
	let [op, f] = OP.get (operator)

	if (type === 'date') {
	
		value = dtISO (value)

		if (op === '<=') {
		
			op = '<'
			
			value = nextDay (value)

		}
		
	}
	
	if (f === 0) return [field, op, value]
	
	let v = String (value)

	if ((f & 1) === 1) v += '%'
	
	if ((f & 2) === 2) v = '%' + v
	
	return [field, op, v]

}

const addFilters = (list, term) => {

	if (term.operator === 'between') {

		const {field, type, value: [from, to]} = term

		if (from) list.push (toComparison ({field, type, operator: 'more', value: from}))

		if (to)   list.push (toComparison ({field, type, operator: 'less', value: to}))

	}
	else {

		list.push (toComparison (term))

	}

}

const setSearch = (from, search) => {

	const part = from [0]
	
	if (part.length === 1) part.push ({})
	
	const options = part [1]
	
	if (!('filters' in options)) options.filters = []

	for (const term of search) addFilters (options.filters, term)

}

function w2uiQuery (from, options = {}) {

	const {rq} = this.job, {sort, search, searchLogic} = rq

	for (const k of ['offset', 'limit']) options [k] = rq [k]
		
	if (sort) options.order = sort.map (o => [o.field, o.direction === 'desc'])

	if (search) setSearch (from, search)

	const query = this.model.createQuery (from, options)
	
	if (searchLogic === 'OR') {
	
		const table = query.tables [0]
		
		table.filters = [new DbQueryOr (table.filters)]
		
	}
		
	return query

}

const plugInto = (db, name = 'w2uiQuery') => {

	db [name] = w2uiQuery
	
	db.shared.add (name)

}

module.exports = {
	toComparison,
	dtISO,
	nextDay,
	addFilters,
	setSearch,
	w2uiQuery,
	plugInto,
}