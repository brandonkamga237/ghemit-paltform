package com.ghemit.platform.newsletter.application.port.in;

import com.ghemit.platform.newsletter.domain.SubscriberId;

/** Suppression définitive d'un abonné depuis le back office. */
public interface RemoveSubscriberUseCase {

	void remove(SubscriberId id);
}
