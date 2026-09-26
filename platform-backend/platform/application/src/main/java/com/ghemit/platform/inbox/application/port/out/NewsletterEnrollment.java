package com.ghemit.platform.inbox.application.port.out;

import com.ghemit.platform.shared.domain.EmailAddress;

/**
 * Inscription automatique à la newsletter des personnes qui écrivent ou candidatent.
 * Port sortant : le contexte « inbox » ignore comment la newsletter est gérée.
 */
public interface NewsletterEnrollment {

	void enroll(EmailAddress email, String name, String source);
}
