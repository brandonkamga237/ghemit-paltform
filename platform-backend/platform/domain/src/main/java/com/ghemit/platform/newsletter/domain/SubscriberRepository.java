package com.ghemit.platform.newsletter.domain;

import com.ghemit.platform.shared.domain.EmailAddress;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/** Port de persistance des abonnés newsletter. */
public interface SubscriberRepository {

	Subscriber save(Subscriber subscriber);

	Optional<Subscriber> findByEmail(EmailAddress email);

	Optional<Subscriber> findById(SubscriberId id);

	List<Subscriber> findAllActive();

	List<Subscriber> findAllNewestFirst();

	/** Inscriptions par jour depuis {@code since} inclus (jours absents non listés). */
	Map<LocalDate, Long> countByDay(LocalDate since);

	void delete(Subscriber subscriber);
}
