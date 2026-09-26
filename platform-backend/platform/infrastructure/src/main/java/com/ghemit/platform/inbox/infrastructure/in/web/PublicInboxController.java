package com.ghemit.platform.inbox.infrastructure.in.web;

import com.ghemit.platform.inbox.application.port.in.SubmitCandidatureCommand;
import com.ghemit.platform.inbox.application.port.in.SubmitCandidatureUseCase;
import com.ghemit.platform.inbox.application.port.in.SubmitContactMessageCommand;
import com.ghemit.platform.inbox.application.port.in.SubmitContactMessageUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Dépôts publics : formulaire de contact et candidatures. */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicInboxController {

	private final SubmitContactMessageUseCase submitContactMessage;
	private final SubmitCandidatureUseCase submitCandidature;

	@PostMapping("/contact")
	public ResponseEntity<Void> contact(@Valid @RequestBody ContactRequest request) {
		submitContactMessage.submit(new SubmitContactMessageCommand(
				request.name(), request.email(), request.subject(), request.message()));
		return ResponseEntity.ok().build();
	}

	@PostMapping("/candidatures")
	public ResponseEntity<Void> candidature(@Valid @RequestBody CandidatureRequest request) {
		submitCandidature.submit(new SubmitCandidatureCommand(request.program(), request.form()));
		return ResponseEntity.ok().build();
	}
}
