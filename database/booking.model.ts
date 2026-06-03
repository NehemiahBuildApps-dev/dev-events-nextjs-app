import { HydratedDocument, Model, Schema, Types, model, models } from "mongoose";
import Event from "./event.model";

export interface IBooking {
    eventId: Types.ObjectId;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

type BookingDocument = HydratedDocument<IBooking>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<IBooking>(
    {
        eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
        email: { type: String, required: true, trim: true, lowercase: true }
    },
    { timestamps: true }
);

bookingSchema.index({ eventId: 1 });
// Block duplicate bookings for the same event/email pair at the database level.
bookingSchema.index({ eventId: 1, email: 1 }, { unique: true });

bookingSchema.pre("save", async function (this: BookingDocument) {
    const normalizedEmail = this.email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
        throw new Error("Invalid email format.");
    }

    this.email = normalizedEmail;

    // Ensure each booking references a real event document.
    const eventExists = await Event.exists({ _id: this.eventId });
    if (!eventExists) {
        throw new Error("Referenced event does not exist.");
    }
});

const Booking = (models.Booking as Model<IBooking> | undefined) ?? model<IBooking>("Booking", bookingSchema);

export default Booking;
