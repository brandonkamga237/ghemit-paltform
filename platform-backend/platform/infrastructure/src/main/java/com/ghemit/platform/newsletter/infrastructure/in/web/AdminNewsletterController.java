package com.ghemit.platform.newsletter.infrastructure.in.web;

import com.ghemit.platform.newsletter.application.port.in.DraftCampaignUseCase;
import com.ghemit.platform.newsletter.application.port.in.NewsletterQuery;
import com.ghemit.platform.newsletter.application.port.in.PreviewNewsletterUseCase;
import com.ghemit.platform.newsletter.application.port.in.RemoveSubscriberUseCase;
import com.ghemit.platform.newsletter.application.port.in.SendCampaignCommand;
import com.ghemit.platform.newsletter.application.port.in.SendCampaignUseCase;
import com.ghemit.platform.newsletter.domain.CampaignId;
import com.ghemit.platform.newsletter.domain.SubscriberId;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/newsletter")
@RequiredArgsConstructor
public class AdminNewsletterController {

	private final NewsletterQuery query;
	private final SendCampaignUseCase sendCampaign;
	private final DraftCampaignUseCase drafts;
	private final PreviewNewsletterUseCase preview;
	private final RemoveSubscriberUseCase removeSubscriber;

	@GetMapping("/subscribers")
	public List<SubscriberResponse> subscribers() {
		return query.subscribers().stream().map(SubscriberResponse::from).toList();
	}

	@DeleteMapping("/subscribers/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void removeSubscriber(@PathVariable UUID id) {
		removeSubscriber.remove(SubscriberId.of(id));
	}

	@GetMapping("/campaigns")
	public List<CampaignResponse> campaigns() {
		return query.campaigns().stream().map(CampaignResponse::from).toList();
	}

	@GetMapping("/activity")
	public List<Map<String, Object>> activity(@RequestParam(defaultValue = "30") int days) {
		return query.subscriberActivity(days).stream()
				.<Map<String, Object>>map(d -> Map.of("day", d.day(), "count", d.count()))
				.toList();
	}

	/** Crée un brouillon. */
	@PostMapping("/campaigns")
	public CampaignResponse createDraft(@Valid @RequestBody SendRequest request) {
		return CampaignResponse.from(
				drafts.saveDraft(new SendCampaignCommand(request.subject(), request.body())));
	}

	/** Modifie un brouillon (uniquement tant qu'il n'est pas envoyé). */
	@PutMapping("/campaigns/{id}")
	public CampaignResponse updateDraft(@PathVariable UUID id,
			@Valid @RequestBody SendRequest request) {
		return CampaignResponse.from(
				drafts.updateDraft(CampaignId.of(id), new SendCampaignCommand(request.subject(), request.body())));
	}

	@DeleteMapping("/campaigns/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteDraft(@PathVariable UUID id) {
		drafts.deleteDraft(CampaignId.of(id));
	}

	/** Envoie un brouillon existant, en tâche de fond. */
	@PostMapping("/campaigns/{id}/send")
	public CampaignResponse sendDraft(@PathVariable UUID id) {
		return CampaignResponse.from(sendCampaign.sendDraft(CampaignId.of(id)));
	}

	/** Compose + envoie directement, en tâche de fond. */
	@PostMapping("/send")
	public CampaignResponse send(@Valid @RequestBody SendRequest request) {
		return CampaignResponse.from(
				sendCampaign.send(new SendCampaignCommand(request.subject(), request.body())));
	}

	/** HTML tel qu'il partira aux abonnés (lien de désinscription factice). */
	@PostMapping("/preview")
	public Map<String, String> preview(@RequestBody PreviewRequest request) {
		return Map.of("html", preview.renderPreview(request.body()));
	}

	public record PreviewRequest(@NotBlank String body) {
	}
}
