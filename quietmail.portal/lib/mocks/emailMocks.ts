import { BatchedSenderActionResult } from "@/app/dashboard/page";

export const MOCK_EMAIL_RESPONSES = {
    partialFailure: {
        totalEmailsTrashed: 4,
        totalSendersUnsubscribed: 1,
        totalSendersRequested: 3,
        hasErrors: false,
        details: [
            { email: "daily@newsletter.techcrunch.com", trashed: false, unsubscribed: true, trashedError: "Failed to trash emails." },
            { email: "events@newsletter.techcrunch.com", trashed: true, unsubscribed: false, unsubscribedError: "Only mailto: links found." },
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

};