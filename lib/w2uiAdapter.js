const {DbQueryAnd, DbQueryOr} = require ('doix-db')

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

const toComparison = (table, {field, type, operator, value}) => {

	if (operator === 'between') {

		const [from, to] = value, list = []

		if (from) list.push (toComparison (table, {field, type, operator: 'more', value: from}))

		if (to)   list.push (toComparison (table, {field, type, operator: 'less', value: to}))
		
		return DbQueryAnd.from (list)

	}

	if (value === null) switch (operator) {
	
		case 'is': return table.createColumnComparison (field, 'IS NULL')

		case 'is not': return table.createColumnComparison (field, 'IS NOT NULL')

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
	
	if (f === 0) return table.createColumnComparison (field, op, value)
		
	let v = String (value)

	if ((f & 1) === 1) v += '%'
	
	if ((f & 2) === 2) v = '%' + v
	
	return table.createColumnComparison (field, op, v)

}

const addAnd = (root, search) => {
	
	for (const term of search) root.addFilter (toComparison (root, term))
	
}

const addOr = (root, search) => {

	root.addFilter (DbQueryOr.from (search.map (i => toComparison (root, i))))

}

function w2uiQuery (from, options = {}) {

	const {rq} = this.job, {sort, search} = rq

	for (const k of ['offset', 'limit']) options [k] = rq [k]

	if (sort) options.order = sort.map (o => [o.field, o.direction === 'desc'])

	const query = this.model.createQuery (from, options)

	if (search) (rq.searchLogic === 'OR' ? addOr : addAnd) (query.root, search)

	return query

}

const plugInto = (db, name = 'w2uiQuery') => {

	db [name] = w2uiQuery
	
	db.shared.add (name)

}

module.exports = {
	dtISO,
	nextDay,
	w2uiQuery,
	plugInto,
}