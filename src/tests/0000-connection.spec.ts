import * as assert from "assert";
import { Connection } from "../core/connection/connection";

describe('connection', () => {
    const db = 'monsel';

    const connection = new Connection({
        uri: `mongodb://localhost:27017/${db}`,
        documents: []
    });

    before(async () => {
        await connection.connect();
    });

    after(async () => {
        await connection.dropDatabase();
        await connection.disconnect();
    });

    it('communicate with mongo', async () => {
        const stats = await connection.stats();

        assert.equal(stats.db, db);
        assert.equal(!!stats.ok, true);
    });

});
