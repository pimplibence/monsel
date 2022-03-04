import { document } from '../../core/document/decorators/document';
import { property } from '../../core/document/decorators/property';
import { BaseDocument } from '../../extra/base.document';

@document({
    collection: 'human',
    indexes: []
})
export class HumanDocument extends BaseDocument {
    @property()
    public name: string;

    @property()
    public age: number;
}
