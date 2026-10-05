package com.ghemit.platform.content.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class EventTest {

	private static final LocalDate TODAY = LocalDate.of(2026, 10, 5);

	private static ContentItem event(String slug, int position, String date) {
		return ContentItem.create(ContentType.EVENT, slug, position,
				Payload.of(Map.of("title", slug, "date", date)));
	}

	@Test
	void un_evenement_sans_statut_n_est_pas_annule() {
		assertThat(Event.isCancelled(Payload.of(Map.of()))).isFalse();
		assertThat(Event.isCancelled(Payload.of(Map.of("status", "cancelled")))).isTrue();
	}

	@Test
	void un_evenement_est_a_venir_si_sa_date_n_est_pas_passee() {
		assertThat(Event.isUpcoming(Payload.of(Map.of("date", "2026-10-05")), TODAY)).isTrue();
		assertThat(Event.isUpcoming(Payload.of(Map.of("date", "2026-12-01")), TODAY)).isTrue();
		assertThat(Event.isUpcoming(Payload.of(Map.of("date", "2026-09-30")), TODAY)).isFalse();
		assertThat(Event.isUpcoming(Payload.of(Map.of()), TODAY)).isTrue();
	}

	@Test
	void le_tri_met_les_prochains_d_abord_puis_les_passes_recents() {
		ContentItem passeLointain = event("a", 0, "2026-01-10");
		ContentItem proche = event("b", 1, "2026-10-20");
		ContentItem passeRecent = event("c", 2, "2026-09-28");
		ContentItem lointain = event("d", 3, "2026-12-15");

		List<ContentItem> trie = List.of(passeLointain, proche, passeRecent, lointain).stream()
				.sorted(Event.calendar(TODAY)).toList();

		assertThat(trie).containsExactly(proche, lointain, passeRecent, passeLointain);
	}

	@Test
	void la_vue_publique_ajoute_upcoming_et_cancelled() {
		Map<String, Object> view = Event.view(
				Payload.of(Map.of("title", "Forum", "date", "2026-11-02", "status", "cancelled")),
				TODAY);

		assertThat(view)
				.containsEntry("upcoming", true)
				.containsEntry("cancelled", true)
				.containsEntry("title", "Forum");
	}
}
