import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

/**
 * GET API route to fetch event details by slug.
 * 
 * @param req - The Next.js request object.
 * @param context - The context object containing route parameters.
 * @returns A JSON response with the event details or an error message.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        // Connect to the database
        await connectDB();

        // Extract the slug from the route parameters
        const { slug } = await params;

        // Validate the slug
        if (!slug) {
            return NextResponse.json(
                { message: "Slug is required" },
                { status: 400 }
            );
        }

        // Query the Event model for the matching slug
        const event = await Event.findOne({ slug });

        // If no event is found, return a 404 response
        if (!event) {
            return NextResponse.json(
                { message: "Event not found" },
                { status: 404 }
            );
        }

        // Return the matching event as JSON
        return NextResponse.json(
            { message: "Event fetched successfully", event },
            { status: 200 }
        );
    } catch (error) {
        // Log the error for server-side debugging
        console.error("GET EVENT BY SLUG API ERROR:", error);

        // Return a 500 internal server error response
        return NextResponse.json(
            {
                message: "An unexpected error occurred while fetching the event",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
