import { expect } from 'chai';
import { HumanDocument } from './documents/human.document';
import { connectDatabase, disconnectDatabase, getConnection, resetDatabase } from './libs/connection-helper';

describe('Connection', async () => {
    before(async () => connectDatabase([HumanDocument]));
    after(async () => resetDatabase());
    after(async () => disconnectDatabase());

    it('check connection status', async () => {
        const enableSharding = process.env.ENABLE_SHARDING === '1';
        const connection = getConnection();

        if (enableSharding) {
            await connection.mongoose.connection.db.admin().command({
                enableSharding: 'tests'
            });

            await connection.mongoose.connection.db.admin().command({
                shardCollection: 'tests.human',
                key: { gender: 'hashed' }
            });
        }

        const stats = await connection.mongoose.connection.db.stats();
        expect(stats.ok).is.equal(1);
    });
});
