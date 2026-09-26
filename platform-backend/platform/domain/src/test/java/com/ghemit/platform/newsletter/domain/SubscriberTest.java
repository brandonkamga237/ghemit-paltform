package com.ghemit.platform.newsletter.domain;

import static org.assertj.core.api.Assertions.assertThat;

import com.ghemit.platform.shared.domain.EmailAddress;
import org.junit.jupiter.api.Test;

class SubscriberTest {

	private static final EmailAddress EMAIL = EmailAddress.of("jeune@gehmit.org");

	@Test
	void un_nouvel_abonne_est_actif() {
		assertThat(Subscriber.subscribe(EMAIL, "Awa", "footer").isActive()).isTrue();
	}

	@Test
	void ignore_un_nom_vide() {
		assertThat(Subscriber.subscribe(EMAIL, "   ", null).name()).isEmpty();
	}

	@Test
	void une_reinscription_reactive_l_abonne() {
		Subscriber subscriber = Subscriber.subscribe(EMAIL, null, null);
		subscriber.unsubscribe();

		subscriber.resubscribe("Awa", "contact");

		assertThat(subscriber.isActive()).isTrue();
	}

	@Test
	void une_reinscription_complete_les_informations_manquantes() {
		Subscriber subscriber = Subscriber.subscribe(EMAIL, null, null);

		subscriber.resubscribe("Awa", "contact");

		assertThat(subscriber.name()).contains("Awa");
		assertThat(subscriber.source()).contains("contact");
	}

	@Test
	void une_reinscription_n_ecrase_pas_les_informations_existantes() {
		Subscriber subscriber = Subscriber.subscribe(EMAIL, "Awa", "footer");

		subscriber.resubscribe("Autre nom", "candidature:paei");

		assertThat(subscriber.name()).contains("Awa");
		assertThat(subscriber.source()).contains("footer");
	}
}
