const { addNewsletterContact, isBrevoConfigured, sendNewsletterWelcomeEmail } = require('../services/email/brevoService');

async function subscribeNewsletter(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
  }
  if (!isBrevoConfigured()) {
    return res.status(503).json({ success: false, message: 'Newsletter signup is temporarily unavailable.' });
  }

  try {
    await addNewsletterContact(email);
    await sendNewsletterWelcomeEmail(email);
    return res.status(200).json({ success: true, message: 'Subscription complete. A welcome email has been sent.' });
  } catch (error) {
    console.error('Brevo newsletter subscription/email failed:', error.message);
    return res.status(502).json({ success: false, message: 'Your subscription email could not be sent. Please try again later.' });
  }
}

module.exports = { subscribeNewsletter };