package com.ghemit.platform.newsletter.domain;

import com.ghemit.platform.shared.domain.EmailAddress;
import java.util.List;
import java.util.Optional;

/** Port de persistance des abonnés newsletter. */
public interface SubscriberRepository {

	Subscriber save(Subscriber subscriber);

	Optional<Subscriber> findByEmail(EmailAddress email);

	Optional<Subscriber> findById(SubscriberId id);

	List<Subscriber> findAllActive();

	List<Subscriber> findAllNewestFirst();

	void delete(Subscriber subscriber);
}
