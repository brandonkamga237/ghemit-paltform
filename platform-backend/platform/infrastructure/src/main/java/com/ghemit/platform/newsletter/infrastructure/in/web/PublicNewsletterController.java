package com.ghemit.platform.newsletter.infrastructure.in.web;

import com.ghemit.platform.newsletter.application.port.in.SubscribeCommand;
import com.ghemit.platform.newsletter.application.port.in.SubscribeToNewsletterUseCase;
import com.ghemit.platform.newsletter.application.port.in.UnsubscribeFromNewsletterUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/newsletter")
@RequiredArgsConstructor
public class PublicNewsletterController {

	private final SubscribeToNewsletterUseCase subscribeToNewsletter;
	private final UnsubscribeFromNewsletterUseCase unsubscribeFromNewsletter;

	@PostMapping("/subscribe")
	public ResponseEntity<Void> subscribe(@Valid @RequestBody SubscribeRequest request) {
		subscribeToNewsletter.subscribe(
				new SubscribeCommand(request.email(), request.name(), request.source()));
		return ResponseEntity.ok().build();
	}

	@PostMapping("/unsubscribe")
	public ResponseEntity<Void> unsubscribe(@Valid @RequestBody SubscribeRequest request) {
		unsubscribeFromNewsletter.unsubscribe(request.email());
		return ResponseEntity.ok().build();
	}
}
