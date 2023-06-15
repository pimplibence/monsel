import { HumanDocument } from './documents/human.document';
import { connectDatabase, disconnectDatabase, resetDatabase } from './libs/connection-helper';
import { seedHumans } from './libs/seeder';

const documents = [
    HumanDocument
];

describe('Document as repository', async () => {
    beforeEach(async () => connectDatabase(documents));
    beforeEach(async () => seedHumans(10));
    afterEach(async () => resetDatabase());
    afterEach(async () => disconnectDatabase());

    it('count', async () => {
        const humans = await HumanDocument.countDocuments({}, { limit: null });
    });
});
