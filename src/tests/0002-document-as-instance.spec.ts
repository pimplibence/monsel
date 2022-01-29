import { ObjectId } from 'bson';
import { expect } from 'chai';
import { CountryDocument } from './_libs/documents/country.document';
import { initConnection } from './_libs/init-connection';

describe('document as instance', () => {
    const connection = initConnection();

    it('create document instance and persist into database', async () => {
        const instance = new CountryDocument();

        expect(instance.name)
            .is.an('undefined');

        instance.name = 'Hello World';

        await instance.save();

        const item = await CountryDocument.findOne<CountryDocument>();

        expect(item.name)
            .is.eq(instance.name);
    });

    it('document must be updatable', async () => {
        const instance = new CountryDocument();

        instance.name = 'Hello World';

        await instance.save();

        const item = await CountryDocument.findOne<CountryDocument>();

        expect(item.name)
            .is.eq(instance.name);

        item.name = 'Updated';

        await item.save();

        const updated = await CountryDocument.findOne<CountryDocument>();

        expect(updated.name)
            .is.eq(updated.name);

        expect(item._id.toString())
            .is.eq(updated._id.toString());
    });

    it('at this point only 2 documents have to be in the database', async () => {
        const count = await CountryDocument.count();

        expect(count)
            .is.eq(2);
    });

    it('each documents must have and ObjectId _id', async () => {
        const items = await CountryDocument.findMany();

        for (const item of items) {
            expect(item)
                .has.a.property('_id')
                .that.is.instanceof(ObjectId);
        }
    });
});
