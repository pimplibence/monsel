import { Connection } from '../../core/connection/connection';
import { CountryDocument } from './documents/country.document';
import { PeopleDocument } from './documents/people.document';

const database = 'database';
const port = 27017;
const host = 'localhost';

export const initConnection = () => {
    const connection = new Connection({
        uri: `mongodb://${host}:${port}/${database}`,
        documents: [
            CountryDocument,
            PeopleDocument
        ]
    });

    before(async () => {
        await connection.connect();
        await connection.syncIndexes();
        await connection.ensureIndexes();
    });

    after(async () => {
        await connection.dropDatabase();
        await connection.disconnect();
    });

    return {
        connection: connection,
        database: database,
        port: port,
        host: host
    };
};
