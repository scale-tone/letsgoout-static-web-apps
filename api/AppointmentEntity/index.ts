import * as df from "durable-functions"
import { AppointmentEntity, AppointmentState } from "./AppointmentEntity";

// Boilerplate to expose AppointmentEntity as a Durable Entity
export default df.entity((context) => new AppointmentEntity(context, () => new AppointmentState()).handleSignal());