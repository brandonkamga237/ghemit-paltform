package com.ghemit.platform.newsletter.application.port.out;

import com.ghemit.platform.shared.domain.EmailAddress;

/** Port sortant d'envoi d'e-mails (SMTP). Le corps est le HTML final du message. */
public interface NewsletterMailSender {

	/** @throws MailDeliveryException si le message n'a pas pu être remis */
	void send(EmailAddress recipient, String subject, String htmlBody);
}
