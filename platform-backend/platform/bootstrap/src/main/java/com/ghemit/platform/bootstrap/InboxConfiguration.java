package com.ghemit.platform.bootstrap;

import com.ghemit.platform.inbox.application.CandidatureService;
import com.ghemit.platform.inbox.application.ContactMessageService;
import com.ghemit.platform.inbox.application.port.out.NewsletterEnrollment;
import com.ghemit.platform.inbox.domain.CandidatureRepository;
import com.ghemit.platform.inbox.domain.ContactMessageRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Câblage du contexte « inbox ». */
@Configuration
class InboxConfiguration {

	@Bean
	CandidatureService candidatureService(CandidatureRepository repository,
			NewsletterEnrollment newsletterEnrollment) {
		return new CandidatureService(repository, newsletterEnrollment);
	}

	@Bean
	ContactMessageService contactMessageService(ContactMessageRepository repository,
			NewsletterEnrollment newsletterEnrollment) {
		return new ContactMessageService(repository, newsletterEnrollment);
	}
}
