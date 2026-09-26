package com.ghemit.platform.newsletter.infrastructure.in.web;

import com.ghemit.platform.newsletter.application.port.in.NewsletterQuery;
import com.ghemit.platform.newsletter.application.port.in.RemoveSubscriberUseCase;
import com.ghemit.platform.newsletter.application.port.in.SendCampaignCommand;
import com.ghemit.platform.newsletter.application.port.in.SendCampaignUseCase;
import com.ghemit.platform.newsletter.domain.SubscriberId;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/newsletter")
@RequiredArgsConstructor
public class AdminNewsletterController {

	private final NewsletterQuery query;
	private final SendCampaignUseCase sendCampaign;
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

	@PostMapping("/send")
	public CampaignResponse send(@Valid @RequestBody SendRequest request) {
		return CampaignResponse.from(sendCampaign.send(new SendCampaignCommand(request.subject(), request.body())));
	}

	@GetMapping("/campaigns")
	public List<CampaignResponse> campaigns() {
		return query.campaigns().stream().map(CampaignResponse::from).toList();
	}
}
