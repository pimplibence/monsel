import { BaseApplication, Provider } from '@kifly/beagle/core/application/base-application';
import { appConfigurator } from '@kifly/beagle/core/application/decorators/app-configurator';
import { Connection } from './core/connection/connection';
import { PandaDocument } from './examples/panda.document';

export class Application extends BaseApplication {
    public providers: Provider[] = [];

    @appConfigurator()
    public async init() {
        const conn = new Connection({
            uri: 'mongodb://localhost:27017',
            documents: [
                PandaDocument
            ]
        });

        await conn.connect();

        const items = await PandaDocument.find<PandaDocument>({});

        console.log(items[0]);
    }
}
