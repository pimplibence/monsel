import { BaseDocument } from '../core/document/base.document';
import { document } from '../core/document/decorators/document';
import { property } from '../core/document/decorators/property';
import { ref } from '../core/document/decorators/ref';
import { refs } from '../core/document/decorators/refs';

@document({
    collection: 'panda'
})
export class PandaDocument extends BaseDocument {
    @property()
    public name: string;

    @property()
    public age: number;

    @ref(() => PandaDocument)
    public crush: PandaDocument | null;

    @refs(() => PandaDocument)
    public plush: PandaDocument[] = [];
}
