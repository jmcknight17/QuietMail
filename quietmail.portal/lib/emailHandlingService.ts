import { TrashEmailResult } from "@/app/dashboard/page";

export const trashEmailsFromSenders = async (senderEmails: string[], provider: string): Promise<TrashEmailResult> => {
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

    return {
        deletedEmails: data.deletedCount ?? 0
    }
};

export const unsubscribeAndTrashEmailsFromSenders = async (senderEmails: string[], provider: string): Promise<TrashEmailResult> => {
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

    return {
        deletedEmails: data.deletedCount ?? 0
    }

};

export const unsubscribeFromSender = async (accessToken: string, senderEmails: string[]) => {
    const response = await fetch('https://localhost:7297/inbox/unsubscribeSenders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(senderEmails)
    });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch {
            errorData = { message: 'Unknown error occurred while unsubscribing from senders.' };
        }
        throw new Error(errorData.message || `Failed to unsubscribe: ${response.statusText}`);
    }
}