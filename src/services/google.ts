import logger from "@/logger/logger";
import axios from "axios";
import { google } from "googleapis";
import { Credentials } from "google-auth-library";
import { config } from "@/config/config";

const GOOGLE_CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.events.owned",
  "https://www.googleapis.com/auth/calendar.events.owned.readonly",
];

const redirectUrl = `${config.url}/auth/google/callback`;

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  redirectUrl || `http://localhost:3000/auth/google/callback`
);

export const generateGoogleRedirectUrl = async () => {
  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: GOOGLE_CALENDAR_SCOPES,
    prompt: "consent",
  });
};

export const generateGoogleToken = async (code: string) => {
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  return tokens;
};

export interface eventDetails {
  summary: string;
  location?: string;
  startDateTime: string;
  endDateTime: string;
  attendeeEmails: string[];
}

export const createMeet = async (
  eventDetails: eventDetails,
  token: Credentials
) => {
  try {
    oAuth2Client.setCredentials(token);
    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    const event = {
      summary: eventDetails.summary,
      description: "realestate",
      location: eventDetails.location || "",
      start: {
        dateTime: eventDetails.startDateTime,
        timeZone: "UTC",
      },
      end: {
        dateTime: eventDetails.endDateTime,
        timeZone: "UTC",
      },
      attendees: eventDetails.attendeeEmails.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    };

    // Insert the event with conferenceData
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: "all",
    });

    return response.data;
  } catch (error) {
    logger.error("Failed to create Google Meet link.");
  }
};

export const getMeetingsFromGoogleCalendar = async (
  token: Credentials,
  filters: any
) => {
  try {
    oAuth2Client.setCredentials(token);
    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    const queryParams = new URLSearchParams();
    if (filters.startDate)
      queryParams.append("timeMin", new Date(filters.startDate).toISOString());
    if (filters.endDate)
      queryParams.append("timeMax", new Date(filters.endDate).toISOString());
    if (filters.keyword) queryParams.append("q", filters.keyword);

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?${queryParams.toString()}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await calendar.events.list({
      calendarId: "primary",
      q: queryParams.toString(),
    });

    if (data.data && data.data.items && data.data.items.length === 0) {
      return [];
    }

    return (
      data.data.items?.filter((event) => event.description === "realestate") ||
      []
    );
  } catch (error) {
    throw new Error("Failed to fetch meetings from Google Calendar.");
  }
};
