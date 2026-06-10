import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/database/booking.model";
import Event from "@/database/event.model";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const formData = await req.formData();
        for (const [key, value] of formData.entries()) {
            console.log(key, value);
        }
        const eventId = formData.get("eventId") as string;
        const email = formData.get("email") as string;

        if (!eventId || !email) {
            return NextResponse.json(
                { message: "eventId and email are required" },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { message: "Invalid email format" },
                { status: 400 }
            );
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return NextResponse.json(
                { message: "Event not found" },
                { status: 404 }
            );
        }

        const booking = await Booking.create({
            eventId,
            email: email.toLowerCase().trim(),
        });

        return NextResponse.json(
            { message: "Booking created successfully", booking },
            { status: 201 }
        );
    } catch (error) {
        console.error("BOOKING API ERROR:", error);

        if ((error as { code?: number })?.code === 11000) {
            return NextResponse.json(
                { message: "You have already booked this event" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                message: "Booking failed",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}