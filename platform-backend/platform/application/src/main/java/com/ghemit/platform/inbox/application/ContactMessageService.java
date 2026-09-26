package com.ghemit.platform.inbox.application;

import com.ghemit.platform.inbox.application.port.in.ContactMessageQuery;
import com.ghemit.platform.inbox.application.port.in.ContactMessageSummary;
import com.ghemit.platform.inbox.application.port.in.ManageContactMessagesUseCase;
import com.ghemit.platform.inbox.application.port.in.SubmitContactMessageCommand;
import com.ghemit.platform.inbox.application.port.in.SubmitContactMessageUseCase;
import com.ghemit.platform.inbox.application.port.in.UpdateContactMessageCommand;
import com.ghemit.platform.inbox.application.port.out.NewsletterEnrollment;
import com.ghemit.platform.inbox.domain.ContactMessage;
import com.ghemit.platform.inbox.domain.ContactMessageCriteria;
import com.ghemit.platform.inbox.domain.ContactMessageId;
import com.ghemit.platform.inbox.domain.ContactMessageRepository;
import com.ghemit.platform.shared.domain.EmailAddress;
import com.ghemit.platform.shared.domain.EntityNotFoundException;
import com.ghemit.platform.shared.domain.Page;
import com.ghemit.platform.shared.domain.PageRequest;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

/** Réception et traitement des messages de contact. */
public class ContactMessageService
		implements SubmitContactMessageUseCase, ContactMessageQuery, ManageContactMessagesUseCase {

	/** Origine enregistrée sur l'abonné newsletter créé depuis le formulaire de contact. */
	private static final String ENROLLMENT_SOURCE = "contact";

	private final ContactMessageRepository repository;
	private final NewsletterEnrollment newsletterEnrollment;

	public ContactMessageService(ContactMessageRepository repository,
			NewsletterEnrollment newsletterEnrollment) {
		this.repository = repository;
		this.newsletterEnrollment = newsletterEnrollment;
	}

	@Override
	@Transactional
	public ContactMessage submit(SubmitContactMessageCommand command) {
		EmailAddress email = EmailAddress.of(command.email());
		ContactMessage saved = repository.save(
				ContactMessage.receive(command.name(), email, command.subject(), command.message()));
		newsletterEnrollment.enroll(email, command.name(), ENROLLMENT_SOURCE);
		return saved;
	}

	@Override
	public Page<ContactMessage> search(ContactMessageCriteria criteria, PageRequest pageRequest) {
		return repository.search(criteria, pageRequest);
	}

	@Override
	public ContactMessageSummary summary() {
		List<ContactMessage> all = repository.findAll();
		long unread = all.stream().filter(message -> !message.isRead()).count();
		return new ContactMessageSummary(all.size(), unread);
	}

	@Override
	@Transactional
	public ContactMessage markAsRead(ContactMessageId id) {
		ContactMessage message = require(id);
		message.markAsRead();
		return repository.save(message);
	}

	@Override
	@Transactional
	public ContactMessage update(UpdateContactMessageCommand command) {
		ContactMessage message = require(command.id());
		if (command.read() != null) {
			message.changeReadFlag(command.read());
		}
		return repository.save(message);
	}

	@Override
	@Transactional
	public void delete(ContactMessageId id) {
		repository.delete(require(id));
	}

	private ContactMessage require(ContactMessageId id) {
		return repository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Message introuvable"));
	}
}
