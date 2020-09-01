import { Context, HttpRequest } from "@azure/functions"

import { DurableEntityProxy } from '../Common/DurableEntityProxy'
import { AppointmentEntity } from '../AppointmentEntity/AppointmentEntity'
import { NickNameHeaderName } from '../shared/Constants'

// Creates a new Appointment
export default async function (context: Context, req: HttpRequest): Promise<void> {

    const nickNames = (req.body as string).split(',').map(name => name.trim());

    const initiatorNickName = req.headers[NickNameHeaderName];
    if (!initiatorNickName) {
        // The initiator's nickName should always be send via that header
        context.res = { status: 403 };
        return;
    }

    // Also adding the initiator to the list
    if (!nickNames.includes(initiatorNickName)) {
        nickNames.push(initiatorNickName);
    }

    // Here is where the AppointmentEntity Key is being generated.
    // Some prefix is needed before a sortable datetime, otherwise SignalR treats this value as a datetime 
    // (not as a string) somewhere inside and trims trailing zeroes from it, effectively corrupting this ID.
    const appointmentId = 'APP-' + new Date().toISOString();

    // Now signalling the entity in a (more or less) strongly typed way
    const entityProxy = new DurableEntityProxy<AppointmentEntity>(context, AppointmentEntity.name, appointmentId);
    await entityProxy.signalEntity('initializeParticipants', nickNames);
};
