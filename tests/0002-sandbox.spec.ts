import * as mongoose from 'mongoose';
import { HumanDocument } from './documents/human.document';
import { connectDatabase, disconnectDatabase, resetDatabase } from './libs/connection-helper';

const documents = [
    HumanDocument
];

const sleep = (duration: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), duration));

describe('Sandbox', () => {
    before(async () => connectDatabase(documents));
    after(async () => resetDatabase());
    after(async () => disconnectDatabase());

    it('Create in transaction', async () => {
        const session = await mongoose.startSession();

        await session.startTransaction();

        const instance = new HumanDocument();

        instance.name = 'Hello Bello';

        await instance.save({ session });

        console.log({
            withTransaction: await HumanDocument.countDocuments({}, { session }),
            withoutTransaction: await HumanDocument.countDocuments({}),
        });

        await sleep(10000);

        const commit = await session.commitTransaction();
        await session.endSession();

        console.log(commit);
    });
});
