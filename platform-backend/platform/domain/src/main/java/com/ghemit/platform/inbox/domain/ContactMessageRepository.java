package com.ghemit.platform.inbox.domain;

import com.ghemit.platform.shared.domain.Page;
import com.ghemit.platform.shared.domain.PageRequest;
import java.util.List;
import java.util.Optional;

/** Port de persistance des messages de contact. */
public interface ContactMessageRepository {

	ContactMessage save(ContactMessage message);

	Optional<ContactMessage> findById(ContactMessageId id);

	void delete(ContactMessage message);

	Page<ContactMessage> search(ContactMessageCriteria criteria, PageRequest pageRequest);

	List<ContactMessage> findAll();
}
