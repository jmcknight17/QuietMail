export const trashEmailsFromSenders = async (accessToken: string, senderEmails: string[]) => {
    const response = await fetch('http://localhost:5022/inbox/trash-emails-from-senders', {
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
            errorData = { message: 'Unknown error occurred while trashing emails.' };
        }
        throw new Error(errorData.message || `Failed to trash emails: ${response.statusText}`);
    }
    return response.ok;
};