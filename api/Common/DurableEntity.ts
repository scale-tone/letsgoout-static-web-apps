import { IEntityFunctionContext } from 'durable-functions/lib/src/classes';

// Base class for Durable Entities. Implements handling signals (by calling child's method with corresponding name)
export class DurableEntity<T> {

    protected state: T;

    protected destructOnExit(): void {
        this._destructOnExit = true;
    }

    constructor(protected context: IEntityFunctionContext, private _stateInitializer: () => T) {
    }

    async handleSignal() {

        // Loading actor's state
        this.state = this.context.df.getState(this._stateInitializer) as T;

        // Checking if there is a method with that name
        const operationName = this.context.df.operationName!;
        if (!(typeof this[operationName] === 'function')) {
            return;
        }

        // Executing the handler
        var result = this[operationName](this.context.df.getInput());

        // Checking if it is a promise that needs to be awaited
        if (DurableEntity.isPromise(result)) {
            result = await result;
        }

        // If the handler signalled the end of lifetime, then destroying ourselves
        if (this._destructOnExit) {
            this.context.df.destructOnExit();
            return;
        }

        // Saving actor's state 
        this.context.df.setState(this.state);

        // Setting return value, if any
        this.context.df.return(result);
    }

    private _destructOnExit: boolean = false;

    private static isPromise(returnValue: any): boolean {
        return (!!returnValue) && typeof returnValue.then === 'function';
    }
}
