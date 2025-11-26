import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";
import { createMeet, eventDetails } from "@/services/google";
import { Request, Response } from "express";
import { Credentials } from "google-auth-library";

declare module "express-session" {
  interface SessionData {
    tokens?: Credentials;
  }
}

export const createCalendarEvent = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    
    const tokens = req.session.tokens;
    
    if (!tokens) {
      return res.status(401).json({
        error: "Google tokens are missing. Please authenticate with Google first.",
        sessionInfo: req.session,
      });
    }
    
    const eventDetails = {
      summary: body.summary,
      location: body.location,
      startDateTime:
        new Date(body.startDateTime).toISOString() || new Date().toISOString(),
      endDateTime:
        new Date(body.endDateTime).toISOString() ||
        new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      attendeeEmails: body.attendeeEmails,
    } as eventDetails;

    const response = await createMeet(eventDetails, tokens);

    await prisma.requestTour.update({
      where: {
        id: body.requestTourId,
      },
      data: {
        link: response?.hangoutLink,
      },
    });
    
    res
      .status(200)
      .json({ message: "Meeting scheduled", meetLink: response?.hangoutLink });
  } catch (error) {
    logger.error("Calendar event creation error:", error);
    res.status(500).json({
      error: "Failed to create calendar event",
    });
  }
};
