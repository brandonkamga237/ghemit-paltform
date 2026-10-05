package com.ghemit.platform.inbox.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.ghemit.platform.shared.domain.BusinessRuleViolationException;
import java.util.Map;
import org.junit.jupiter.api.Test;

class CandidatureTest {

	private static Candidature candidature() {
		return Candidature.submit(ProgramCode.of("paei"), ApplicationForm.of(Map.of("nom", "Ngo")));
	}

	@Test
	void une_candidature_deposee_est_non_lue_et_nouvelle() {
		Candidature candidature = candidature();

		assertThat(candidature.isRead()).isFalse();
		assertThat(candidature.status()).isEqualTo(CandidatureStatus.NEW);
		assertThat(candidature.note()).isEmpty();
	}

	@Test
	void une_note_vide_equivaut_a_une_absence_de_note() {
		Candidature candidature = candidature();

		candidature.annotate("   ");

		assertThat(candidature.note()).isEmpty();
	}

	@Test
	void refuse_un_programme_vide() {
		assertThatThrownBy(() -> ProgramCode.of(" "))
				.isInstanceOf(BusinessRuleViolationException.class);
	}

	@Test
	void refuse_un_statut_inconnu() {
		assertThatThrownBy(() -> CandidatureStatus.fromCode("en_attente"))
				.isInstanceOf(BusinessRuleViolationException.class);
	}

	@Test
	void interprete_un_statut_absent_en_base_comme_nouveau() {
		assertThat(CandidatureStatus.fromStoredCode(null)).isEqualTo(CandidatureStatus.NEW);
		assertThat(CandidatureStatus.fromStoredCode("in_progress"))
				.isEqualTo(CandidatureStatus.IN_PROGRESS);
	}

	@Test
	void le_traitement_avance_sans_retour_en_arriere() {
		Candidature candidature = candidature();

		candidature.changeStatus(CandidatureStatus.IN_PROGRESS);
		candidature.changeStatus(CandidatureStatus.ACCEPTED);
		candidature.changeStatus(CandidatureStatus.ARCHIVED);

		assertThat(candidature.status()).isEqualTo(CandidatureStatus.ARCHIVED);
	}

	@Test
	void les_transitions_interdites_sont_refusees() {
		Candidature candidature = candidature();
		candidature.changeStatus(CandidatureStatus.ACCEPTED);

		assertThatThrownBy(() -> candidature.changeStatus(CandidatureStatus.IN_PROGRESS))
				.isInstanceOf(BusinessRuleViolationException.class);
	}

	@Test
	void un_dossier_non_retenu_ou_archive_peut_etre_rouvert() {
		Candidature candidature = candidature();
		candidature.changeStatus(CandidatureStatus.IN_PROGRESS);
		candidature.changeStatus(CandidatureStatus.REJECTED);

		candidature.changeStatus(CandidatureStatus.IN_PROGRESS);

		assertThat(candidature.status()).isEqualTo(CandidatureStatus.IN_PROGRESS);
	}
}
