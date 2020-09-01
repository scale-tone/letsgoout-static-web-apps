import { Context } from '@azure/functions'
import * as df from 'durable-functions'
import { DurableOrchestrationClient } from 'durable-functions/lib/src/classes';

// Durable Entity's Proxy. Sends signals and reads your entity's state in a strongly-typed manner.
export class DurableEntityProxy<T> {

    constructor(context: Context, entityName: string, entityKey: string) {
        this._client = df.getClient(context);
        this._entityId = new df.EntityId(entityName, entityKey);
    }

    async signalEntity(operationName: keyof T, operationContent?: any): Promise<void> {
        return this._client.signalEntity(this._entityId, operationName as string, operationContent);
    }

    async readEntityState<TState>(): Promise<TState> {
        const stateResponse = await this._client.readEntityState<TState>(this._entityId);

        if (!stateResponse.entityExists) {
            throw this._entityId.toString() + ' doesn\'t exist';
        }

        return stateResponse.entityState;
    }

    private _entityId: df.EntityId;
    private _client: DurableOrchestrationClient;
}