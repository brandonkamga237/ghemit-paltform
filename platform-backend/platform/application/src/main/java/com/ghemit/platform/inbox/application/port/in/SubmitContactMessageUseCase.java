package com.ghemit.platform.inbox.application.port.in;

import com.ghemit.platform.inbox.domain.ContactMessage;

/** Dépôt d'un message depuis le formulaire de contact du site public. */
public interface SubmitContactMessageUseCase {

	ContactMessage submit(SubmitContactMessageCommand command);
}
