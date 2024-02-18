const {DbModel} = require ('doix-db')
const Path = require ('path')
const src = Path.join (__dirname, 'data', 'root1')
const {w2uiQuery} = require ('../lib/w2uiAdapter.js')

class Job {

	constructor (model, rq) {
	
		this.rq = rq
	
		this.db = {w2uiQuery, model}
		
		this.db.job = this
	
	}

}

const q = (l, o) => {

	jest.resetModules ()
	
	const m = new DbModel ({src})	

	m.loadModules ()

	return new Job (m, l).db.w2uiQuery (o)

}

const pq = (l, o) => {

	return q (l, o).toParamsSql ()

}


test ('basic', () => {

	expect (pq (
		{}, 
		[['users']]
	)).toStrictEqual (['SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users"'])

})

test ('limit', () => {

	expect (q (
		{
			limit: 50,
			offset: 0,		
		}, 
		[['users']]
	).options).toStrictEqual ({limit: 50, offset: 0})

})

test ('sort', () => {

	expect (pq (
		{
			sort: [{field: 'label'}]
		}, 
		[['users']]
	)).toStrictEqual (['SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users" ORDER BY "users"."label"'])

})

test ('noop', () => {

	expect (() => pq (
		{
			search: [{field: 'label', operator: '∇', value: 'admin'}]
		}, 
		[['users']]
	)).toThrow ('Unknown operator')

})

test ('like', () => {

	expect (pq (
		{
			search: [{field: 'label', operator: 'begins', value: 'admin'}]
		}, 
		[['users']]
	)).toStrictEqual (['admin%', 'SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users" WHERE UPPER("users"."label") LIKE UPPER(?)'])

	expect (pq (
		{
			search: [{field: 'label', operator: 'ends', value: 'admin'}]
		}, 
		[['users']]
	)).toStrictEqual (['%admin', 'SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users" WHERE UPPER("users"."label") LIKE UPPER(?)'])

	expect (pq (
		{
			search: [{field: 'label', operator: 'contains', value: 'admin'}]
		}, 
		[['users']]
	)).toStrictEqual (['%admin%', 'SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users" WHERE UPPER("users"."label") LIKE UPPER(?)'])

})

test ('null', () => {

	expect (pq (
		{
			search: [{field: 'label', operator: 'is', value: null}]
		}, 
		[['users']]
	)).toStrictEqual (['SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users" WHERE "users"."label" IS NULL'])

	expect (pq (
		{
			search: [{field: 'label', operator: 'is not', value: null}]
		}, 
		[['users']]
	)).toStrictEqual (['SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users" WHERE "users"."label" IS NOT NULL'])

	expect (() => pq (
		{
			search: [{field: 'label', operator: 'less', value: null}]
		}, 
		[['users']]
	)).toThrow ('invalid')

})


test ('between', () => {

	expect (pq (
		{
			search: [{field: 'label', operator: 'between', value: []}]
		},
		[['users']]
	)).toStrictEqual (['SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users"'])

	expect (pq (
		{
			search: [{field: 'label', operator: 'between', value: ['a']}]
		}, 
		[['users']]
	)).toStrictEqual (['a', 'SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users" WHERE "users"."label" >= ?'])

	expect (pq (
		{
			search: [{field: 'label', operator: 'between', value: [null, 'z']}]
		}, 
		[['users']]
	)).toStrictEqual (['z', 'SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users" WHERE "users"."label" <= ?'])

	expect (pq (
		{
			search: [{field: 'label', operator: 'between', type: 'date', value: ['01.02.2005', '31.12.2005']}]
		}, 
		[['users']]
	)).toStrictEqual (['2005-02-01', '2006-01-01', 'SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users" WHERE (("users"."label" >= ?) AND ("users"."label" < ?))'])

})

test ('or', () => {

	expect (pq (
		{
			searchLogic: 'OR',
			search: [
				{field: 'label', operator: 'is', value: 'admin'},
				{field: 'label', operator: 'is', value: 'user'},
			]
		}, 
		[['users', {filters: [['is_actual', '=', true]]}]]
	)).toStrictEqual ([true, 'admin', 'user', 'SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users" WHERE "users"."is_actual" = ? AND (("users"."label" = ?) OR ("users"."label" = ?))'])

	expect (pq (
		{
			searchLogic: 'OR',
			search: [
				{field: 'label', operator: 'is', value: 'admin'},
				{field: 'label', operator: 'is'},
			]
		}, 
		[['users', {filters: [['is_actual', '=', true]]}]]
	)).toStrictEqual ([true, 'admin', 'SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users" WHERE "users"."is_actual" = ? AND (("users"."label" = ?))'])

	expect (pq (
		{
			searchLogic: 'OR',
			search: [
				{field: 'label', operator: 'is'},
				{field: 'label', operator: 'is'},
			]
		}, 
		[['users', {filters: [['is_actual', '=', true]]}]]
	)).toStrictEqual ([true, 'SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users" WHERE "users"."is_actual" = ?'])

})


test ('and', () => {

	const _ = q (
		{
			search: [
				{field: 'label', operator: 'more', value: 'a'},
				{field: 'label', operator: 'less', value: 'z'},
				{field: 'note', operator: 'is', value: 'WANTED'},
			]
		}, 
		[['users', {filters: [['is_actual', '=', true]]}]]
	)	

	expect (_.toParamsSql ()).toStrictEqual ([true, 'a', 'z', 'SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users" WHERE "users"."is_actual" = ? AND "users"."label" >= ? AND "users"."label" <= ?'])

	expect (_.tables [0].unknownColumnComparisons).toStrictEqual ([['note', '=', 'WANTED']])

})