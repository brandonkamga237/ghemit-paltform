package com.ghemit.platform.inbox.domain;

import com.ghemit.platform.shared.domain.Page;
import com.ghemit.platform.shared.domain.PageRequest;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/** Port de persistance des messages de contact. */
public interface ContactMessageRepository {

	ContactMessage save(ContactMessage message);

	Optional<ContactMessage> findById(ContactMessageId id);

	void delete(ContactMessage message);

	Page<ContactMessage> search(ContactMessageCriteria criteria, PageRequest pageRequest);

	List<ContactMessage> findAll();

	/** Réceptions par jour depuis {@code since} inclus (jours absents non listés). */
	Map<LocalDate, Long> countByDay(LocalDate since);
}
