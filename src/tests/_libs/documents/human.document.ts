import { AbstractDocument } from '../../../core/document/abstract.document';
import { document } from '../../../core/document/decorators/document';
import { beforeCreate } from '../../../core/document/decorators/lifecycle-callback';
import { property } from '../../../core/document/decorators/property';

@document({
    collection: 'human'
})
export class HumanDocument extends AbstractDocument {
    @property()
    public gender: string;

    @beforeCreate()
    public aaaa() {
        this.gender = (Math.random() > .5) ? 'male' : 'female';
    }
}
