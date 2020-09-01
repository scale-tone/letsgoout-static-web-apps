import { DurableEntity } from '../Common/DurableEntity'
import { AppointmentStatusEnum } from '../shared/AppointmentStatusEnum'
import { SignalRClientHandlerName } from '../shared/Constants'

// The AppointmentEntity's state. This is what is being persisted in the storage.
export class AppointmentState {
    participants: string[] = [];
    participantsAccepted: string[] = [];
}

// Durable Entity representing the negotiated appointment
export class AppointmentEntity extends DurableEntity<AppointmentState>
{
    // Initializes an appointment with the list of participants
    async initializeParticipants(participants: string[]): Promise<void> {
        this.state.participants = this.distinctValues(participants);
        this.notifyParticipants(this.state.participants, AppointmentStatusEnum.Pending);
    }

    // Accepts a response from a participant
    setResponse(response: AppointmentResponse): void {
        
        // Just to make sure this response came from one of participants
        if (!this.state.participants.includes(response.nickName)) {
            return;
        }

        // If someone has rejected...
        if (!response.isAccepted) {
            // ... then notifying everybody and killing ourselves
            this.notifyParticipants(this.state.participants, AppointmentStatusEnum.Declined);
            this.destructOnExit();
            return;
        }

        // Adding the responding participant to the list of participants that have accepted
        if (!this.state.participantsAccepted.includes(response.nickName)) {
            this.state.participantsAccepted.push(response.nickName);
        }

        // If everybody have accepted
        if (this.setsAreEqual(this.state.participants, this.state.participantsAccepted)) {
            // ... then notifying everybody and killing ourselves
            this.notifyParticipants(this.state.participants, AppointmentStatusEnum.Accepted);
            this.destructOnExit();
        }
    }

    // Informs participants of the appointment state changes via SignalR
    notifyParticipants(nickNames: string[], status: AppointmentStatusEnum): void {

        const appointmentId = this.context.df.entityKey;

        this.context.bindings.signalRMessages = nickNames.map(nickName => { return {
            userId: nickName,
            target: SignalRClientHandlerName,
            arguments: [{
                id: appointmentId,
                participants: nickNames,
                status
            }]
        };})
    }

    private distinctValues(values: string[]): string[] {
        return values.filter((value, index) => values.indexOf(value) === index);
    }

    private setsAreEqual(set1: string[], set2: string[]) {
        return set1.length === set2.length && set1.every(v => set2.includes(v));
    }
}

// Parameter for 'setResponse' method
export class AppointmentResponse {
    nickName: string;
    isAccepted: boolean;
}
