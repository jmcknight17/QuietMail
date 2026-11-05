import { BatchedSenderActionResult } from "@/app/dashboard/page";

export const MOCK_EMAIL_RESPONSES = {
    partialFailure: {
        totalEmailsTrashed: 1,
        totalSendersUnsubscribed: 1,
        totalSendersRequested: 3,
        hasErrors: true,
        details: [
            { email: "daily@newsletter.techcrunch.com", trashed: true, unsubscribed: false},
            { email: "events@newsletter.techcrunch.com", trashed: true, unsubscribed: false},
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