import { Schema, model, models, Model } from "mongoose";

export interface IEvent {
    _id: any;
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string; // ISO string
    time: string; // HH:mm
    mode: string;
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

function slugify(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

const eventSchema = new Schema<IEvent>(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, unique: true },

        description: { type: String, required: true, trim: true },
        overview: { type: String, required: true, trim: true },

        image: { type: String, required: true, trim: true },

        venue: { type: String, required: true, trim: true },
        location: { type: String, required: true, trim: true },

        date: { type: String, required: true },
        time: { type: String, required: true },

        mode: { type: String, required: true, trim: true },
        audience: { type: String, required: true, trim: true },

        agenda: { type: [String], required: true },
        organizer: { type: String, required: true, trim: true },

        tags: { type: [String], required: true },
    },
    { timestamps: true }
);

eventSchema.pre("save", function () {
    if (this.isModified("title")) {
        this.slug = slugify(this.title);
    }
});

const Event =
    (models.Event as Model<IEvent>) || model<IEvent>("Event", eventSchema);

export default Event;