const {w2uiAdapter} = require ('..')

const w2ui = new w2uiAdapter ()

test ('basic', () => {

	expect (w2ui).toBeInstanceOf (w2uiAdapter)

})