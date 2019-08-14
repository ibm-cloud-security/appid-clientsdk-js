const assert = require('assert');
const Utils = require('../src/utils');
const utils = new Utils();

describe('Utils tests', () => {
	it('should return a param string', () => {
		let res = utils.buildParams({param1: 'test', param2: 'test', param3: 'test'});
		assert.deepEqual(res, 'param1=test&param2=test&param3=test');
	});
});