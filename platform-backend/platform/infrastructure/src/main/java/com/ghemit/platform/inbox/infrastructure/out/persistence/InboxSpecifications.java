package com.ghemit.platform.inbox.infrastructure.out.persistence;

import com.ghemit.platform.inbox.domain.ApplicationForm;
import com.ghemit.platform.inbox.domain.CandidatureCriteria;
import com.ghemit.platform.inbox.domain.ContactMessageCriteria;
import com.ghemit.platform.inbox.domain.ProgramCode;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.data.jpa.domain.Specification;

/** Traduction des critères du domaine en prédicats JPA. */
final class InboxSpecifications {

	/** Fonction PostgreSQL utilisée pour chercher dans le formulaire stocké en jsonb. */
	private static final String JSON_TEXT_FUNCTION = "jsonb_extract_path_text";

	private InboxSpecifications() {
	}

	static Specification<CandidatureJpaEntity> of(CandidatureCriteria criteria) {
		return (root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();
			if (criteria.hasProgramFilter()) {
				predicates.add(root.get("program")
						.in(criteria.programs().stream().map(ProgramCode::value).toList()));
			}
			if (criteria.read() != null) {
				predicates.add(cb.equal(root.get("readFlag"), criteria.read()));
			}
			if (criteria.status() != null) {
				predicates.add(cb.equal(root.get("status"), criteria.status().code()));
			}
			if (criteria.hasSearch()) {
				String like = like(criteria.search());
				List<Predicate> matches = ApplicationForm.SEARCHABLE_FIELDS.stream()
						.map(field -> cb.like(cb.lower(cb.function(JSON_TEXT_FUNCTION, String.class,
								root.get("form"), cb.literal(field))), like))
						.map(Predicate.class::cast)
						.toList();
				predicates.add(cb.or(matches.toArray(new Predicate[0])));
			}
			return cb.and(predicates.toArray(new Predicate[0]));
		};
	}

	static Specification<ContactMessageJpaEntity> of(ContactMessageCriteria criteria) {
		return (root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();
			if (criteria.read() != null) {
				predicates.add(cb.equal(root.get("readFlag"), criteria.read()));
			}
			if (criteria.hasSearch()) {
				String like = like(criteria.search());
				predicates.add(cb.or(
						cb.like(cb.lower(root.get("name")), like),
						cb.like(cb.lower(root.get("email")), like),
						cb.like(cb.lower(root.get("subject")), like),
						cb.like(cb.lower(root.get("message")), like)));
			}
			return cb.and(predicates.toArray(new Predicate[0]));
		};
	}

	private static String like(String search) {
		return "%" + search.toLowerCase(Locale.ROOT) + "%";
	}
}
