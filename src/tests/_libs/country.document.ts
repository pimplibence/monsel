import { AbstractDocument } from '../../core/document/abstract.document';
import { document } from '../../core/document/decorators/document';
import { property } from '../../core/document/decorators/property';

@document({
    collection: 'country'
})
export class CountryDocument extends AbstractDocument {
    @property()
    public name: string;
}