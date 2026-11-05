import { BatchedSenderActionResult } from "@/app/dashboard/page";

export const MOCK_EMAIL_RESPONSES = {
    partialFailure: {
        totalEmailsTrashed: 1,
        totalSendersUnsubscribed: 1,
        totalSendersRequested: 3,
        hasErrors: true,
        details: [
            { email: "daily@newsletter.techcrunch.com", trashed: true, unsubscribed: false, trashedError: "Failed to delete emails due to API error", unsubscribedError: "Failed to unsubscribe due to API error" },
            { email: "events@newsletter.techcrunch.com", trashed: true, unsubscribed: true},
        ]
    },
    noFailures:{
        totalEmailsTrashed: 4,
        totalSendersUnsubscribed: 1,
        totalSendersRequested: 3,
        hasErrors: false,
        details: [
            { email: "daily@newsletter.techcrunch.com", trashed: true, unsubscribed: true },
            { email: "events@newsletter.techcrunch.com", trashed: true, unsubscribed: true },
        ]
    },
    YuhHuh:{
        totalEmailsTrashed: 4,
        totalSendersUnsubscribed: 1,
        totalSendersRequested: 3,
        hasErrors: false,
        details: [
            { email: "daily@newsletter.techcrunch.com", trashed: true, unsubscribed: true },
            { email: "events@newsletter.techcrunch.com", trashed: true, unsubscribed: true},
        ]
    },

};