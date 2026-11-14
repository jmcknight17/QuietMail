import { BatchedSenderActionResult, SenderActionResult } from "@/app/dashboard/page";
import {MOCK_EMAIL_RESPONSES} from "@/lib/mocks/emailMocks";
import { CONFIG } from "@/lib/config";

const mapBatchedResponse = (data: any): BatchedSenderActionResult => {
    return {
        totalEmailsTrashed: data.totalEmailsTrashed ?? 0,
        totalSendersUnsubscribed: data.totalSendersUnsubscribed ?? 0,
        totalSendersRequested: data.totalSendersRequested ?? 0,
        hasErrors: data.hasPartialFailures ?? data.hasErrors ?? false,
        details: (data.details || []).map((d: any): SenderActionResult => ({
            email: d.email || d.senderEmail || '',
            unsubscribed: d.unsubscribed ?? false,
            trashed: d.trashed ?? false,
            unsubscribedError: d.unsubscribeError || d.unsubscribedError || undefined,
            trashedError: d.trashError || d.trashedError || undefined,
        }))
    };
};

export const trashEmailsFromSenders = async (senderEmails: string[], provider: string): Promise<BatchedSenderActionResult> => {

    if (CONFIG.useMockData) {
        return MOCK_EMAIL_RESPONSES.partialFailure;
    }
    const response = await fetch(`https://localhost:7297/inbox/${provider}/trash-emails-from-senders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ Senders: senderEmails })
    });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch {
            errorData = { message: 'Unknown error occurred while trashing emails.' };
        }
        throw new Error(errorData.message || `Failed to trash emails: ${response.statusText}`);
    }
    const data = await response.json();
    return mapBatchedResponse(data);
};

export const unsubscribeAndTrashEmailsFromSenders = async (senderEmails: string[], provider: string): Promise<BatchedSenderActionResult> => {

    if (CONFIG.useMockData) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return MOCK_EMAIL_RESPONSES.partialFailure;
    }

    const response = await fetch(`https://localhost:7297/inbox/${provider}/trashAndUnsubscribeSenders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Senders: senderEmails }),
        credentials: 'include'
    });
    
    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch {
            errorData = { message: 'Unknown error occurred while trashing emails.' };
        }
        throw new Error(errorData.message || `Failed to trash emails: ${response.statusText}`);
    }
    const data = await response.json();
    return mapBatchedResponse(data);
};