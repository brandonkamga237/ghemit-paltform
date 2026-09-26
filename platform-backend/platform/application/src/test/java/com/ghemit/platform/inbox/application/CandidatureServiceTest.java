package com.ghemit.platform.inbox.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.ghemit.platform.inbox.application.port.in.SubmitCandidatureCommand;
import com.ghemit.platform.inbox.application.port.out.NewsletterEnrollment;
import com.ghemit.platform.inbox.domain.Candidature;
import com.ghemit.platform.inbox.domain.CandidatureCriteria;
import com.ghemit.platform.inbox.domain.CandidatureId;
import com.ghemit.platform.inbox.domain.CandidatureRepository;
import com.ghemit.platform.shared.domain.EmailAddress;
import com.ghemit.platform.shared.domain.Page;
import com.ghemit.platform.shared.domain.PageRequest;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class CandidatureServiceTest {

	private final InMemoryCandidatures candidatures = new InMemoryCandidatures();
	private final RecordingEnrollment enrollment = new RecordingEnrollment();
	private final CandidatureService service = new CandidatureService(candidatures, enrollment);

	@Test
	void une_candidature_inscrit_le_candidat_a_la_newsletter_avec_son_origine() {
		service.submit(new SubmitCandidatureCommand("paei",
				Map.of("prenom", "Awa", "nom", "Ngo", "email", "awa@gehmit.org")));

		assertThat(enrollment.calls).hasSize(1);
		assertThat(enrollment.calls.getFirst().email().value()).isEqualTo("awa@gehmit.org");
		assertThat(enrollment.calls.getFirst().name()).isEqualTo("Awa Ngo");
		assertThat(enrollment.calls.getFirst().source()).isEqualTo("candidature:paei");
	}

	@Test
	void une_candidature_sans_adresse_exploitable_n_inscrit_personne() {
		service.submit(new SubmitCandidatureCommand("mentorat", Map.of("nom", "Ngo")));

		assertThat(enrollment.calls).isEmpty();
		assertThat(candidatures.findAll()).hasSize(1);
	}

	@Test
	void le_resume_compte_les_candidatures_par_programme_et_par_statut() {
		service.submit(new SubmitCandidatureCommand("paei", Map.of()));
		service.submit(new SubmitCandidatureCommand("paei", Map.of()));
		service.submit(new SubmitCandidatureCommand("mentorat", Map.of()));

		var summary = service.summary();

		assertThat(summary.total()).isEqualTo(3);
		assertThat(summary.unread()).isEqualTo(3);
		assertThat(summary.byProgram()).containsEntry("paei", 2L).containsEntry("mentorat", 1L);
		assertThat(summary.byStatus()).containsEntry("new", 3L);
	}

	@Test
	void marquer_comme_lu_est_persiste() {
		Candidature submitted = service.submit(new SubmitCandidatureCommand("paei", Map.of()));

		service.markAsRead(submitted.id());

		assertThat(candidatures.findById(submitted.id()).orElseThrow().isRead()).isTrue();
	}

	private record EnrollmentCall(EmailAddress email, String name, String source) {}

	private static final class RecordingEnrollment implements NewsletterEnrollment {

		private final List<EnrollmentCall> calls = new ArrayList<>();

		@Override
		public void enroll(EmailAddress email, String name, String source) {
			calls.add(new EnrollmentCall(email, name, source));
		}
	}

	private static final class InMemoryCandidatures implements CandidatureRepository {

		private final Map<CandidatureId, Candidature> store = new LinkedHashMap<>();

		@Override
		public Candidature save(Candidature candidature) {
			store.put(candidature.id(), candidature);
			return candidature;
		}

		@Override
		public Optional<Candidature> findById(CandidatureId id) {
			return Optional.ofNullable(store.get(id));
		}

		@Override
		public void delete(Candidature candidature) {
			store.remove(candidature.id());
		}

		@Override
		public Page<Candidature> search(CandidatureCriteria criteria, PageRequest pageRequest) {
			return Page.of(List.copyOf(store.values()), store.size(), pageRequest);
		}

		@Override
		public List<Candidature> findAll() {
			return List.copyOf(store.values());
		}
	}
}
