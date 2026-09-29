// src/automation/automationService.js
const brevoService = require('../services/email/brevoService'); // Aapke existing service ka path

/**
 * Ek generic function jo email bhejta hai
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content of the email
 */
exports.sendEmail = async (to, subject, htmlContent) => {
    try {
        // Aapke brevoService ke hisaab se ye function call karein
        await brevoService.sendTransactionalEmail({
            to: [{ email: to }],
            subject: subject,
            htmlContent: htmlContent,
        });
        console.log(`Automated email sent to ${to}`);
    } catch (error) {
        console.error(`Failed to send automated email to ${to}:`, error);
    }
};