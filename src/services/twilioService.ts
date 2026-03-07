import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Default sandbox number

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

/**
 * Normalizes a phone number to E.164 format.
 * Target: +59899123456
 */
function normalizePhone(phone: string): string {
    // Remove all non-numeric characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // Handle Uruguayan numbers starting with 09... (9 digits)
    if (cleaned.startsWith('09') && cleaned.length === 9) {
        cleaned = '+598' + cleaned.substring(1);
    }
    // Handle Uruguayan numbers starting with 9... (8 digits)
    else if (cleaned.startsWith('9') && cleaned.length === 8) {
        cleaned = '+598' + cleaned;
    }
    // If it starts with 598 but no +, add it
    else if (cleaned.startsWith('598') && !cleaned.startsWith('+')) {
        cleaned = '+' + cleaned;
    }
    // Final check: if it doesn't start with +, assume it needs one if it's long enough
    else if (!cleaned.startsWith('+') && cleaned.length >= 8) {
        cleaned = '+' + cleaned;
    }

    return cleaned;
}

export const twilioService = {
    /**
     * Sends a WhatsApp message using Twilio.
     * @param to The recipient's phone number
     * @param body The message content
     */
    async sendWhatsApp(to: string, body: string): Promise<any> {
        if (!client) {
            console.error('Twilio client not initialized. Check environment variables.');
            return { error: 'Twilio not configured' };
        }

        const normalizedTo = normalizePhone(to);
        const formattedTo = normalizedTo.startsWith('whatsapp:') ? normalizedTo : `whatsapp:${normalizedTo}`;

        try {
            const message = await client.messages.create({
                body,
                from: fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`,
                to: formattedTo
            });
            console.log(`WhatsApp message sent to ${normalizedTo}: ${message.sid}`);
            return message;
        } catch (error) {
            console.error(`Failed to send WhatsApp to ${to} (normalized as ${normalizedTo}):`, error);
            throw error;
        }
    }
};
