export class ValidationErrors extends Error {
    public errors: any[];

    constructor(errors: any[]) {
        super('ValidationErrors');

        this.errors = errors || [];
    }
}
