import { HydratedDocument, Model, Schema, model, models } from "mongoose";

export interface IEvent {
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: string;
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

type EventDocument = HydratedDocument<IEvent>;

const requiredStringFields: Array<keyof Omit<IEvent, "slug" | "agenda" | "tags" | "createdAt" | "updatedAt">> = [
    "title",
    "description",
    "overview",
    "image",
    "venue",
    "location",
    "date",
    "time",
    "mode",
    "audience",
    "organizer"
];

function slugify(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function normalizeDateToIso(value: string): string {
    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        throw new Error("Invalid event date.");
    }

    // Store date consistently as an ISO-8601 string.
    return parsedDate.toISOString();
}

function normalizeTime(value: string): string {
    const trimmedValue = value.trim();

    const twelveHourMatch = trimmedValue.match(/^(\d{1,2}):(\d{2})\s*([aApP][mM])$/);
    if (twelveHourMatch) {
        const [, hourString, minuteString, period] = twelveHourMatch;
        const hour = Number.parseInt(hourString, 10);
        const minute = Number.parseInt(minuteString, 10);

        if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
            throw new Error("Invalid event time.");
        }

        const hour24 = period.toLowerCase() === "pm" ? (hour % 12) + 12 : hour % 12;
        return `${hour24.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    }

    const twentyFourHourMatch = trimmedValue.match(/^(\d{1,2}):(\d{2})$/);
    if (twentyFourHourMatch) {
        const [, hourString, minuteString] = twentyFourHourMatch;
        const hour = Number.parseInt(hourString, 10);
        const minute = Number.parseInt(minuteString, 10);

        if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
            throw new Error("Invalid event time.");
        }

        return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    }

    throw new Error("Invalid event time.");
}

function validateRequiredFields(doc: EventDocument): void {
    for (const field of requiredStringFields) {
        const value = doc[field];
        if (typeof value !== "string" || value.trim().length === 0) {
            throw new Error(`Event field "${field}" is required.`);
        }
    }

    if (doc.agenda.length === 0 || doc.agenda.some((item) => item.trim().length === 0)) {
        throw new Error('Event field "agenda" must contain non-empty strings.');
    }

    if (doc.tags.length === 0 || doc.tags.some((item) => item.trim().length === 0)) {
        throw new Error('Event field "tags" must contain non-empty strings.');
    }
}

const eventSchema = new Schema<IEvent>(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, unique: true, trim: true },
        description: { type: String, required: true, trim: true },
        overview: { type: String, required: true, trim: true },
        image: { type: String, required: true, trim: true },
        venue: { type: String, required: true, trim: true },
        location: { type: String, required: true, trim: true },
        date: { type: String, required: true, trim: true },
        time: { type: String, required: true, trim: true },
        mode: { type: String, required: true, trim: true },
        audience: { type: String, required: true, trim: true },
        agenda: { type: [String], required: true },
        organizer: { type: String, required: true, trim: true },
        tags: { type: [String], required: true }
    },
    { timestamps: true }
);

eventSchema.index({ slug: 1 }, { unique: true });

// Pre-save hook for slug generation and data normalizing
eventSchema.pre("save", function (this: EventDocument, next) {
    try {
        validateRequiredFields(this);

        if (this.isModified("title")) {
            // Regenerate slug only when the title changes.
            this.slug = slugify(this.title);
        }

        // Normalize date and time formats before writing to MongoDB.
        this.date = normalizeDateToIso(this.date);
        this.time = normalizeTime(this.time);

        next();
    } catch (error: unknown) {
        next(error instanceof Error ? error : new Error("Failed to validate event."));
    }
});

const Event = (models.Event as Model<IEvent> | undefined) ?? model<IEvent>("Event", eventSchema);

export default Event;
