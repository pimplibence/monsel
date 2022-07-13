import { HumanDocument } from './documents/human.document';
import { connectDatabase, disconnectDatabase, resetDatabase } from './libs/connection-helper';
import { seedHumans } from './libs/seeder';

const documents = [
    HumanDocument
];

describe('Document as repository', async () => {
    before(async () => connectDatabase(documents));
    before(async () => seedHumans(10));
    after(async () => resetDatabase());
    after(async () => disconnectDatabase());

    it('count', async () => {
        const humans = await HumanDocument.countDocuments({}, { limit: null });
    });
});
