import { expect } from 'chai';
import { HumanDocument } from './documents/human.document';
import { connectDatabase, disconnectDatabase, resetDatabase } from './libs/connection-helper';

const documents = [
    HumanDocument
];

describe('Document as instance', async () => {
    before(async () => connectDatabase(documents));
    after(async () => resetDatabase());
    after(async () => disconnectDatabase());

    it('create', async () => {
        const instance = new HumanDocument();

        instance.name = 'John Doe';
        instance.age = 28;

        expect(instance.createdAt).is.equals(undefined);
        expect(instance.createdAt).is.equals(undefined);

        await instance.save(null, { skipValidation: false });

        expect(instance.name).is.equals('John Doe');
        expect(instance.age).is.equals(28);
        expect(instance.createdAt).is.instanceof(Date);
        expect(instance.updatedAt).is.instanceof(Date);

        const fetched = await HumanDocument.findOne<HumanDocument>();

        expect(instance.name).is.equals(fetched.name);
        expect(instance.age).is.equals(fetched.age);
        expect(instance.createdAt.toString()).is.equals(fetched.createdAt.toString());
        expect(instance.updatedAt.toString()).is.equals(fetched.updatedAt.toString());
    });
});
