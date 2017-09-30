import { assertion } from '../../src/assertions/isXHRSuccess';

describe('isXHRSuccess', () => {
    it('passes if status is status equals \'success\'', (done) => {
        const listened = {
            url: 'some/path',
            status: 'success',
        };

        const assert = new assertion(listened);
        assert.command(value => {
            expect(assert.pass(value)).toEqual(true);
            done();
        })
    });
    it('fails if status is status equals \'error\'', (done) => {
        const listened = {
            url: 'some/path',
            status: 'error',
        };

        const assert = new assertion(listened);
        assert.command(value => {
            expect(assert.pass(value)).toEqual(false);
            done();
        })
    });
    it('fails if status is undefined', (done) => {
        const listened = { url: 'some/path' };

        const assert = new assertion(listened);
        assert.command(value => {
            expect(assert.pass(value)).toEqual(false);
            done();
        })
    });
    it('fails if undefined', (done) => {
        const assert = new assertion(undefined);
        assert.command(value => {
            expect(assert.pass(value)).toEqual(false);
            done();
        })
    });
    it('outputs url in message', () => {
        const assert = new assertion({ url: 'some/path' });
        expect(assert.message).toContain('some/path');
    });
    it('truncates url in message if larger than 30 chars', () => {
        const assert = new assertion({ url: 'some/really/long/long/path/that/is/called/in/xhr' });
        expect(assert.message).toContain(' some/really/long/long/path/... ');
    });
    it('outputs success in expected properties', () => {
        const assert = new assertion({ url: 'some/path' });
        expect(assert.expected).toContain('success');
    });
    it('outputs status in value', (done) => {
        const assert = new assertion({ url: 'some/path', status: 'someStatus' });
        assert.command(result => {
            expect(assert.value(result)).toEqual('someStatus');
            done();
        });
    });
});
