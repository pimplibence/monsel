import { expect } from 'chai';
import { range } from 'lodash';
import { afterEach, beforeEach } from 'mocha';
import { HumanDocument } from './documents/human.document';
import { connectDatabase, disconnectDatabase, resetDatabase } from './libs/connection-helper';

const documents = [
    HumanDocument
];

describe('Document as instance', async () => {
    beforeEach(async () => connectDatabase(documents));
    afterEach(async () => resetDatabase());
    afterEach(async () => disconnectDatabase());

    it('create', async () => {
        const instance = new HumanDocument();

        instance.name = 'John Doe';

        expect(instance.createdAt).is.equals(undefined);
        expect(instance.random).is.equals(undefined);

        await instance.save(null, { skipValidation: false });

        expect(instance.name).is.equals('John Doe');
        expect(instance.createdAt).is.instanceof(Date);
        expect(instance.updatedAt).is.instanceof(Date);
        expect(instance.random).is.a('number');

        const fetched = await HumanDocument.findOne<HumanDocument>();

        expect(instance.name).is.equals(fetched.name);
        expect(instance.createdAt.toString()).is.equals(fetched.createdAt.toString());
        expect(instance.updatedAt.toString()).is.equals(fetched.updatedAt.toString());
        expect(instance.random).is.equals(fetched.random);
    });

    it('update', async () => void 0);

    it('delete', async () => {
        for (const item of range(3)) {
            const instance = new HumanDocument();
            instance.name = item.toString();
            await instance.save({});
        }

        const i1 = await HumanDocument.findMany();

        expect(i1.length).is.equals(3);

        await i1[0].remove();

        const i2 = await HumanDocument.findMany();

        expect(i2.length).is.equals(2);
    });
});
