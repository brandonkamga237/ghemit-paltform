package com.ghemit.platform.newsletter;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
public class NewsletterController {

	private final NewsletterService service;
	private final NewsletterSubscriberRepository subscribers;
	private final NewsletterCampaignRepository campaigns;

	public record SubscribeRequest(@NotBlank @Email String email, String name, String source) {}
	public record SendRequest(@NotBlank String subject, @NotBlank String body) {}

	// ---- Public ----

	@PostMapping("/api/public/newsletter/subscribe")
	public ResponseEntity<Void> subscribe(@Valid @RequestBody SubscribeRequest req) {
		service.subscribe(req.email(), req.name(), req.source());
		return ResponseEntity.ok().build();
	}

	@PostMapping("/api/public/newsletter/unsubscribe")
	public ResponseEntity<Void> unsubscribe(@Valid @RequestBody SubscribeRequest req) {
		service.unsubscribe(req.email());
		return ResponseEntity.ok().build();
	}

	// ---- Admin ----

	@GetMapping("/api/admin/newsletter/subscribers")
	public List<NewsletterSubscriber> list() {
		return subscribers.findAll().stream()
				.sorted(Comparator.comparing(NewsletterSubscriber::getCreatedAt).reversed())
				.toList();
	}

	@DeleteMapping("/api/admin/newsletter/subscribers/{id}")
	public ResponseEntity<Void> remove(@PathVariable UUID id) {
		NewsletterSubscriber s = subscribers.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Abonné introuvable"));
		subscribers.delete(s);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/api/admin/newsletter/send")
	public NewsletterCampaign send(@Valid @RequestBody SendRequest req) {
		return service.send(req.subject(), req.body());
	}

	@GetMapping("/api/admin/newsletter/campaigns")
	public List<NewsletterCampaign> campaigns() {
		return campaigns.findAll().stream()
				.sorted(Comparator.comparing(NewsletterCampaign::getSentAt).reversed())
				.toList();
	}
}
