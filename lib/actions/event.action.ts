'use server';

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

export const getAllEvents = async () => {
    try {
        await connectDB();
        return await Event.find({}).lean();
    } catch (e) {
        return [];
    }
}

export const getEventBySlug = async (slug: string) => {
    try {
        await connectDB();
        const event = await Event.findOne({ slug }).lean();
        if (!event) return null;
        return event;
    } catch (e) {
        return null;
    }
}

export const getSimilarEventBySlug = async (slug: string) => {
    try {
        await connectDB();
        const event = await Event.findOne({ slug });
        if (!event) return [];
        return await Event.find({ _id: { $ne: event._id }, tags: { $in: event.tags } }).lean();
    } catch (e) {
        return [];
    }
}