import * as assert from "assert";
import { connectDatabase, disconnectDatabase, resetDatabase } from './libs/connection-helper';

describe('Hello World!', async () => {
    beforeEach(async () => connectDatabase());
    afterEach(async () => resetDatabase());
    afterEach(async () => disconnectDatabase());

    it('Case #1', async () => {
        assert.equal(1, 1);
    });

});
