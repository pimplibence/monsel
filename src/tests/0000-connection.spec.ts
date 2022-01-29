import * as assert from "assert";
import { initConnection } from './_libs/init-connection';

describe('connection', () => {
    const connection = initConnection();

    it('communicate with mongo', async () => {
        const stats = await connection.connection.stats();

        assert.equal(stats.db, connection.database);
        assert.equal(!!stats.ok, true);
    });

});
