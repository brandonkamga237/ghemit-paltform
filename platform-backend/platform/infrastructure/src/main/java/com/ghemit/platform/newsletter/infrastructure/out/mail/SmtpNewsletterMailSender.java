package com.ghemit.platform.newsletter.infrastructure.out.mail;

import com.ghemit.platform.newsletter.application.port.out.MailDeliveryException;
import com.ghemit.platform.newsletter.application.port.out.NewsletterMailSender;
import com.ghemit.platform.shared.domain.EmailAddress;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

/** Adaptateur SMTP du port {@link NewsletterMailSender}. */
@Slf4j
@Component
public class SmtpNewsletterMailSender implements NewsletterMailSender {

	private final JavaMailSender mailSender;
	private final String from;

	public SmtpNewsletterMailSender(JavaMailSender mailSender, @Value("${app.mail.from}") String from) {
		this.mailSender = mailSender;
		this.from = from;
	}

	@Override
	public void send(EmailAddress recipient, String subject, String body) {
		SimpleMailMessage message = new SimpleMailMessage();
		message.setFrom(from);
		message.setTo(recipient.value());
		message.setSubject(subject);
		message.setText(body);
		try {
			mailSender.send(message);
		} catch (Exception e) {
			log.warn("Envoi newsletter impossible vers {} : {}", recipient.value(), e.getMessage());
			throw new MailDeliveryException("Envoi impossible vers " + recipient.value(), e);
		}
	}
}
