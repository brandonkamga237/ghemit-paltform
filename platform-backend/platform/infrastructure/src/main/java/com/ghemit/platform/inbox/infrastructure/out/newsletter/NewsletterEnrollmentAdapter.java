package com.ghemit.platform.inbox.infrastructure.out.newsletter;

import com.ghemit.platform.inbox.application.port.out.NewsletterEnrollment;
import com.ghemit.platform.newsletter.application.port.in.SubscribeCommand;
import com.ghemit.platform.newsletter.application.port.in.SubscribeToNewsletterUseCase;
import com.ghemit.platform.shared.domain.EmailAddress;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Relie le contexte « inbox » au contexte « newsletter ». Les deux contextes
 * s'ignorent : seul cet adaptateur connaît les deux côtés.
 */
@Component
@RequiredArgsConstructor
public class NewsletterEnrollmentAdapter implements NewsletterEnrollment {

	private final SubscribeToNewsletterUseCase subscribeToNewsletter;

	@Override
	public void enroll(EmailAddress email, String name, String source) {
		subscribeToNewsletter.subscribe(new SubscribeCommand(email.value(), name, source));
	}
}
