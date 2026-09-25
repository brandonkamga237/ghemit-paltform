package com.ghemit.platform.inbox;

import com.ghemit.platform.newsletter.NewsletterService;
import jakarta.persistence.criteria.Predicate;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
public class InboxController {

	private final ContactMessageRepository messages;
	private final CandidatureRepository candidatures;
	private final NewsletterService newsletter;

	public record ContactRequest(String name, @NotBlank @Email String email, String subject,
			@NotBlank String message) {}

	public record CandidatureRequest(@NotBlank String program, Map<String, Object> form) {}

	// ---- Public ----

	@PostMapping("/api/public/contact")
	public ResponseEntity<Void> contact(@Valid @RequestBody ContactRequest req) {
		ContactMessage m = new ContactMessage();
		m.setName(req.name());
		m.setEmail(req.email());
		m.setSubject(req.subject());
		m.setMessage(req.message());
		messages.save(m);
		newsletter.subscribe(req.email(), req.name(), "contact");
		return ResponseEntity.ok().build();
	}

	@PostMapping("/api/public/candidatures")
	public ResponseEntity<Void> candidature(@Valid @RequestBody CandidatureRequest req) {
		Candidature c = new Candidature();
		c.setProgram(req.program());
		c.setForm(req.form() != null ? req.form() : Map.of());
		candidatures.save(c);
		Object email = c.getForm().get("email");
		if (email instanceof String s && !s.isBlank()) {
			Object prenom = c.getForm().get("prenom");
			Object nom = c.getForm().get("nom");
			String name = ((prenom instanceof String p ? p + " " : "")
					+ (nom instanceof String n ? n : "")).trim();
			newsletter.subscribe(s, name.isBlank() ? null : name, "candidature:" + req.program());
		}
		return ResponseEntity.ok().build();
	}

	// ---- Admin ----

	private static final Set<String> CANDIDATURE_STATUSES =
			Set.of("new", "in_progress", "accepted", "rejected", "archived");

	/** Clés du formulaire candidat dans lesquelles la recherche texte est effectuée. */
	private static final List<String> SEARCH_KEYS = List.of(
			"prenom", "nom", "email", "telephone", "phone", "organisation", "interlocuteur");

	@GetMapping("/api/admin/messages")
	public Page<ContactMessage> messagesPage(
			@RequestParam(value = "read", required = false) Boolean read,
			@RequestParam(value = "q", required = false) String q,
			@RequestParam(value = "page", defaultValue = "0") int page,
			@RequestParam(value = "size", defaultValue = "20") int size,
			@RequestParam(value = "sort", defaultValue = "createdAt,desc") String sort) {
		Specification<ContactMessage> spec = (root, query, cb) -> {
			List<Predicate> ps = new ArrayList<>();
			if (read != null) ps.add(cb.equal(root.get("readFlag"), read));
			if (q != null && !q.isBlank()) {
				String like = "%" + q.toLowerCase() + "%";
				ps.add(cb.or(
						cb.like(cb.lower(root.get("name")), like),
						cb.like(cb.lower(root.get("email")), like),
						cb.like(cb.lower(root.get("subject")), like),
						cb.like(cb.lower(root.get("message")), like)));
			}
			return cb.and(ps.toArray(new Predicate[0]));
		};
		return messages.findAll(spec, pageRequest(page, size, sort));
	}

	@GetMapping("/api/admin/messages/summary")
	public Map<String, Object> messagesSummary() {
		List<ContactMessage> all = messages.findAll();
		Map<String, Object> out = new LinkedHashMap<>();
		out.put("total", all.size());
		out.put("unread", all.stream().filter(m -> !m.isReadFlag()).count());
		return out;
	}

	@PatchMapping("/api/admin/messages/{id}/read")
	public ContactMessage markMessageRead(@PathVariable UUID id) {
		ContactMessage m = messages.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message introuvable"));
		m.setReadFlag(true);
		return messages.save(m);
	}

	@PatchMapping("/api/admin/messages/{id}")
	public ContactMessage updateMessage(@PathVariable UUID id, @RequestBody Map<String, Object> patch) {
		ContactMessage m = messages.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message introuvable"));
		if (patch.get("readFlag") instanceof Boolean b) m.setReadFlag(b);
		return messages.save(m);
	}

	@GetMapping("/api/admin/candidatures")
	public Page<Candidature> candidaturesPage(
			@RequestParam(value = "program", required = false) String program,
			@RequestParam(value = "read", required = false) Boolean read,
			@RequestParam(value = "status", required = false) String status,
			@RequestParam(value = "q", required = false) String q,
			@RequestParam(value = "page", defaultValue = "0") int page,
			@RequestParam(value = "size", defaultValue = "20") int size,
			@RequestParam(value = "sort", defaultValue = "createdAt,desc") String sort) {
		Specification<Candidature> spec = (root, query, cb) -> {
			List<Predicate> ps = new ArrayList<>();
			if (program != null && !program.isBlank()) {
				List<String> programs = Arrays.stream(program.split(","))
						.map(String::trim).filter(s -> !s.isEmpty()).toList();
				if (!programs.isEmpty()) ps.add(root.get("program").in(programs));
			}
			if (read != null) ps.add(cb.equal(root.get("readFlag"), read));
			if (status != null && !status.isBlank()) ps.add(cb.equal(root.get("status"), status));
			if (q != null && !q.isBlank()) {
				String like = "%" + q.toLowerCase() + "%";
				List<Predicate> ors = new ArrayList<>();
				for (String k : SEARCH_KEYS) {
					ors.add(cb.like(cb.lower(
							cb.function("jsonb_extract_path_text", String.class,
									root.get("form"), cb.literal(k))), like));
				}
				ps.add(cb.or(ors.toArray(new Predicate[0])));
			}
			return cb.and(ps.toArray(new Predicate[0]));
		};
		return candidatures.findAll(spec, pageRequest(page, size, sort));
	}

	@GetMapping("/api/admin/candidatures/summary")
	public Map<String, Object> candidaturesSummary() {
		List<Candidature> all = candidatures.findAll();
		Map<String, Long> byProgram = new LinkedHashMap<>();
		Map<String, Long> byStatus = new LinkedHashMap<>();
		for (Candidature c : all) {
			byProgram.merge(c.getProgram(), 1L, Long::sum);
			byStatus.merge(c.getStatus() == null ? "new" : c.getStatus(), 1L, Long::sum);
		}
		Map<String, Object> out = new LinkedHashMap<>();
		out.put("total", all.size());
		out.put("unread", all.stream().filter(c -> !c.isReadFlag()).count());
		out.put("byProgram", byProgram);
		out.put("byStatus", byStatus);
		return out;
	}

	@PatchMapping("/api/admin/candidatures/{id}/read")
	public Candidature markCandidatureRead(@PathVariable UUID id) {
		Candidature c = candidatures.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidature introuvable"));
		c.setReadFlag(true);
		return candidatures.save(c);
	}

	@PatchMapping("/api/admin/candidatures/{id}")
	public Candidature updateCandidature(@PathVariable UUID id, @RequestBody Map<String, Object> patch) {
		Candidature c = candidatures.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidature introuvable"));
		if (patch.get("readFlag") instanceof Boolean b) c.setReadFlag(b);
		if (patch.get("status") instanceof String s && CANDIDATURE_STATUSES.contains(s)) {
			c.setStatus(s);
		}
		if (patch.containsKey("note")) {
			Object n = patch.get("note");
			c.setNote(n == null ? null : String.valueOf(n));
		}
		return candidatures.save(c);
	}

	@DeleteMapping("/api/admin/candidatures/{id}")
	public ResponseEntity<Void> deleteCandidature(@PathVariable UUID id) {
		Candidature c = candidatures.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidature introuvable"));
		candidatures.delete(c);
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/api/admin/messages/{id}")
	public ResponseEntity<Void> deleteMessage(@PathVariable UUID id) {
		ContactMessage m = messages.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message introuvable"));
		messages.delete(m);
		return ResponseEntity.noContent().build();
	}

	private PageRequest pageRequest(int page, int size, String sort) {
		Sort s = switch (sort) {
			case "createdAt,asc" -> Sort.by("createdAt").ascending();
			case "program" -> Sort.by("program").ascending().and(Sort.by("createdAt").descending());
			case "status" -> Sort.by("status").ascending().and(Sort.by("createdAt").descending());
			default -> Sort.by("createdAt").descending();
		};
		return PageRequest.of(Math.max(0, page), Math.clamp(size, 1, 100), s);
	}
}
