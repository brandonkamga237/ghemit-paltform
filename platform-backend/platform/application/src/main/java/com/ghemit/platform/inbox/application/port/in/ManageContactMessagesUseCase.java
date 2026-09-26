package com.ghemit.platform.inbox.application.port.in;

import com.ghemit.platform.inbox.domain.ContactMessage;
import com.ghemit.platform.inbox.domain.ContactMessageId;

/** Traitement des messages de contact par l'équipe. */
public interface ManageContactMessagesUseCase {

	ContactMessage markAsRead(ContactMessageId id);

	ContactMessage update(UpdateContactMessageCommand command);

	void delete(ContactMessageId id);
}
