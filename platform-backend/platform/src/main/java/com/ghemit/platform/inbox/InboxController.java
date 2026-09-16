package com.ghemit.platform.inbox;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
public class InboxController {

	private final ContactMessageRepository messages;
	private final CandidatureRepository candidatures;

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
		return ResponseEntity.ok().build();
	}

	@PostMapping("/api/public/candidatures")
	public ResponseEntity<Void> candidature(@Valid @RequestBody CandidatureRequest req) {
		Candidature c = new Candidature();
		c.setProgram(req.program());
		c.setForm(req.form() != null ? req.form() : Map.of());
		candidatures.save(c);
		return ResponseEntity.ok().build();
	}

	// ---- Admin ----

	@GetMapping("/api/admin/messages")
	public List<ContactMessage> messages() {
		return messages.findAll().stream()
				.sorted(Comparator.comparing(ContactMessage::getCreatedAt).reversed())
				.toList();
	}

	@PatchMapping("/api/admin/messages/{id}/read")
	public ContactMessage markMessageRead(@PathVariable UUID id) {
		ContactMessage m = messages.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message introuvable"));
		m.setReadFlag(true);
		return messages.save(m);
	}

	@GetMapping("/api/admin/candidatures")
	public List<Candidature> candidatures() {
		return candidatures.findAll().stream()
				.sorted(Comparator.comparing(Candidature::getCreatedAt).reversed())
				.toList();
	}

	@PatchMapping("/api/admin/candidatures/{id}/read")
	public Candidature markCandidatureRead(@PathVariable UUID id) {
		Candidature c = candidatures.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidature introuvable"));
		c.setReadFlag(true);
		return candidatures.save(c);
	}
}
