import { BatchedSenderActionResult } from "@/app/dashboard/page";

export const MOCK_EMAIL_RESPONSES = {
    partialFailure: {
        totalEmailsTrashed: 1,
        totalSendersUnsubscribed: 0,
        totalSendersRequested: 3,
        hasErrors: true,
        details: [
            { email: "daily@newsletter.techcrunch.com", trashed: false, unsubscribed: false, trashedError: "Failed to trash emails for this sender." },
            { email: "events@newsletter.techcrunch.com", trashed: false, unsubscribed: false, trashedError: "Failed to unsubscribe from this sender." },
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