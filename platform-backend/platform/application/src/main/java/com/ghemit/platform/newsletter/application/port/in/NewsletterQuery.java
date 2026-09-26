package com.ghemit.platform.newsletter.application.port.in;

import com.ghemit.platform.newsletter.domain.Campaign;
import com.ghemit.platform.newsletter.domain.Subscriber;
import java.util.List;

/** Consultation des abonnés et de l'historique des campagnes. */
public interface NewsletterQuery {

	List<Subscriber> subscribers();

	List<Campaign> campaigns();
}
