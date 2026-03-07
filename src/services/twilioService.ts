import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Default sandbox number

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export const twilioService = {
    /**
     * Sends a WhatsApp message using Twilio.
     * @param to The recipient's phone number (with country code, e.g., '+59899123456')
     * @param body The message content
     */
    async sendWhatsApp(to: string, body: string): Promise<any> {
        if (!client) {
            console.error('Twilio client not initialized. Check environment variables.');
            return { error: 'Twilio not configured' };
        }

        // Format number if it doesn't start with whatsapp:
        const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

        try {
            const message = await client.messages.create({
                body,
                from: fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`,
                to: formattedTo
            });
            console.log(`WhatsApp message sent to ${to}: ${message.sid}`);
            return message;
        } catch (error) {
            console.error(`Failed to send WhatsApp to ${to}:`, error);
            throw error;
        }
    }
};
