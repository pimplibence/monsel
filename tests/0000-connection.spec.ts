import { expect } from 'chai';
import { afterEach, beforeEach } from 'mocha';
import { HumanDocument } from './documents/human.document';
import { connectDatabase, disconnectDatabase, getConnection, resetDatabase } from './libs/connection-helper';

const documents = [
    HumanDocument
];

describe('Connection', async () => {
    beforeEach(async () => connectDatabase(documents));
    afterEach(async () => resetDatabase());
    afterEach(async () => disconnectDatabase());

    it('check connection status', async () => {
        const connection = getConnection();
        const stats = await connection.mongoose.connection.db.stats();

        expect(stats.ok).is.equals(1);
    });

    it('check connection on document', async () => {
        const count = await HumanDocument.countDocuments();

        expect(count).is.equals(0);
    });
});
