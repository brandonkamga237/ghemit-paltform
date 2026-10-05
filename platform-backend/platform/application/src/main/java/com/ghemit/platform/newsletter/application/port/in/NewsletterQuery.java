package com.ghemit.platform.newsletter.application.port.in;

import com.ghemit.platform.newsletter.domain.Campaign;
import com.ghemit.platform.newsletter.domain.Subscriber;
import java.time.LocalDate;
import java.util.List;

/** Consultation des abonnés, des campagnes et de la courbe d'inscriptions. */
public interface NewsletterQuery {

	List<Subscriber> subscribers();

	List<Campaign> campaigns();

	/** Inscriptions par jour sur les {@code days} derniers jours, jours creux inclus. */
	List<DayCount> subscriberActivity(int days);

	record DayCount(LocalDate day, long count) {
	}
}
