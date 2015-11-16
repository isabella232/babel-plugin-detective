/* eslint-env node, mocha */

import assert from 'assert';
const babel = require('babel');
import detective from '../';
import {getFixturePath, metadata} from './_utils';

function parseFixture(fixtureFile, position, opts) {
	var path = getFixturePath(fixtureFile);
	var result = babel.transformFileSync(path, {
		plugins: [{transformer: detective, position: position}],
		extra: {
			detective: opts || {}
		}
	});
	result.options = {filename: path};
	return result;
}

describe('mocha-5', function () {
	it('produces a list of expressions', () => {
		var parseResult = parseFixture('fixture.js');
		assert.deepEqual(metadata(parseResult), {
			strings: ['b', 'foo'],
			expressions: [{
				start: 60,
				end: 73,
				loc: {
					start: {
						line: 7,
						column: 8
					},
					end: {
						line: 7,
						column: 21
					}
				}
			}]
		});
		assert.deepEqual(metadata(parseResult, true), {
			strings: ['b', 'foo'],
			expressions: [`'foo' + 'bar'`]
		});
	});

	it('before builtin plugins', () => {
		var parseResult = parseFixture('fixture.js', 'before');
		assert.deepEqual(metadata(parseResult), {
			strings: ['b', 'foo'],
			expressions: [{
				start: 60,
				end: 73,
				loc: {
					start: {
						line: 7,
						column: 8
					},
					end: {
						line: 7,
						column: 21
					}
				}
			}]
		});
		assert.deepEqual(metadata(parseResult, true), {
			strings: ['b', 'foo'],
			expressions: [`'foo' + 'bar'`]
		});
	});

	it('after builtin plugins', () => {
		var parseResult = parseFixture('fixture.js', 'after');
		assert.deepEqual(metadata(parseResult), {
			strings: ['b', 'foo'],
			expressions: [{
				start: 60,
				end: 73,
				loc: {
					start: {
						line: 7,
						column: 8
					},
					end: {
						line: 7,
						column: 21
					}
				}
			}]
		});
		assert.deepEqual(metadata(parseResult, true), {
			strings: ['b', 'foo'],
			expressions: [`'foo' + 'bar'`]
		});
	});

	it('alternate word', () => {
		var parseResult = parseFixture('fixture.js', 'before', {word: '__dereq__'});
		assert.deepEqual(metadata(parseResult), {
			strings: ['b', 'baz'],
			expressions: []
		});
	});

	it('imports can be excluded', () => {
		var parseResult = parseFixture('fixture.js', 'before', {includeImport: false});
		assert.deepEqual(metadata(parseResult, true), {
			strings: ['foo'],
			expressions: [`'foo' + 'bar'`]
		});
	});

	it('require statements can be excluded', () => {
		var parseResult = parseFixture('fixture.js', 'before', {includeRequire: false});

		assert.deepEqual(metadata(parseResult), {
			strings: ['b'],
			expressions: []
		});
	});

	it('attachExpressionSource attaches code to location object', () => {
		var parseResult = parseFixture('fixture.js', 'after', {attachExpressionSource: true});

		assert.deepEqual(metadata(parseResult), {
			strings: ['b', 'foo'],
			expressions: [{
				start: 60,
				end: 73,
				code: `'foo' + 'bar'`,
				loc: {
					start: {
						line: 7,
						column: 8
					},
					end: {
						line: 7,
						column: 21
					}
				}
			}]
		});
	});
});