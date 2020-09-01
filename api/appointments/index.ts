import { Context, HttpRequest } from "@azure/functions"

import { DurableEntityProxy } from '../Common/DurableEntityProxy'
import { AppointmentEntity, AppointmentResponse } from '../AppointmentEntity/AppointmentEntity'
import { AppointmentStatusEnum } from '../shared/AppointmentStatusEnum'
import { NickNameHeaderName } from '../shared/Constants'

// Receives responses from participants
export default async function (context: Context, req: HttpRequest): Promise<void> {

    const status = req.body as AppointmentStatusEnum;
    if (status === AppointmentStatusEnum.Pending) {
        context.res = { status: 400 };
        return;
    }

    // Transforming client's response into a Signal
    const entityProxy = new DurableEntityProxy<AppointmentEntity>(context, AppointmentEntity.name, context.bindingData.appointmentId);
    await entityProxy.signalEntity('setResponse', <AppointmentResponse> {
        nickName: req.headers[NickNameHeaderName],
        isAccepted: status === AppointmentStatusEnum.Accepted
    });
};
