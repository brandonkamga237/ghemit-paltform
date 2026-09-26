package com.ghemit.platform.inbox.application.port.in;

import com.ghemit.platform.inbox.domain.ContactMessage;
import com.ghemit.platform.inbox.domain.ContactMessageCriteria;
import com.ghemit.platform.shared.domain.Page;
import com.ghemit.platform.shared.domain.PageRequest;

/** Consultation des messages de contact par le back office. */
public interface ContactMessageQuery {

	Page<ContactMessage> search(ContactMessageCriteria criteria, PageRequest pageRequest);

	ContactMessageSummary summary();
}
