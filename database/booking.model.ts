import {
    Schema,
    model,
    models,
    Types,
    Model,
} from "mongoose";

export interface IBooking {
    eventId: Types.ObjectId;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<IBooking>(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: (v: string) => emailRegex.test(v),
                message: "Invalid email format",
            },
        },
    },
    { timestamps: true }
);

// indexes
bookingSchema.index({ eventId: 1 });
bookingSchema.index({ eventId: 1, email: 1 }, { unique: true });

// ✅ SAFE validation (NO next(), NO circular import)
bookingSchema.pre("save", async function () {
    const Booking = this as IBooking;

    const EventModel = model("Event");
    const exists = await EventModel.findById(Booking.eventId);

    if (!exists) {
        throw new Error("Event does not exist");
    }
});

const Booking =
    (models.Booking as Model<IBooking>) ||
    model<IBooking>("Booking", bookingSchema);

export default Booking;

