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

    it('ref & populate', async () => {
        const johnDoe = await HumanDocument.findOne<HumanDocument>();
        const hisBrother = new HumanDocument();

        hisBrother.name = 'John\'s Brother';
        hisBrother.brother = johnDoe;

        await hisBrother.save();

        expect(hisBrother.brother.toString())
            .is.eq(johnDoe._id.toString());

        await hisBrother.populate([
            { path: 'brother' }
        ]);

        expect(hisBrother.brother)
            .is.instanceof(HumanDocument)
            .and.has.property('name')
            .is.equals(johnDoe.name);
    });

    it('refs & populate', async () => void 0);

    it('populate', async () => void 0);
});
