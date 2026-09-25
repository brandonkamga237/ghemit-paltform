package com.ghemit.platform.newsletter;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsletterService {

	private final NewsletterSubscriberRepository subscribers;
	private final NewsletterCampaignRepository campaigns;
	private final JavaMailSender mailSender;

	@Value("${app.mail.from}")
	private String from;

	@Transactional
	public NewsletterSubscriber subscribe(String email) {
		return subscribe(email, null, null);
	}

	@Transactional
	public NewsletterSubscriber subscribe(String email, String name, String source) {
		String normalized = email.trim().toLowerCase();
		String cleanName = name == null || name.isBlank() ? null : name.trim();
		String cleanSource = source == null || source.isBlank() ? null : source.trim();
		return subscribers.findByEmailIgnoreCase(normalized)
				.map(s -> {
					s.setActive(true);
					if (cleanName != null && (s.getName() == null || s.getName().isBlank())) {
						s.setName(cleanName);
					}
					if (cleanSource != null && (s.getSource() == null || s.getSource().isBlank())) {
						s.setSource(cleanSource);
					}
					return subscribers.save(s);
				})
				.orElseGet(() -> {
					NewsletterSubscriber s = new NewsletterSubscriber();
					s.setEmail(normalized);
					s.setName(cleanName);
					s.setSource(cleanSource);
					return subscribers.save(s);
				});
	}

	@Transactional
	public void unsubscribe(String email) {
		subscribers.findByEmailIgnoreCase(email.trim()).ifPresent(s -> {
			s.setActive(false);
			subscribers.save(s);
		});
	}

	@Transactional
	public NewsletterCampaign send(String subject, String body) {
		List<NewsletterSubscriber> recipients = subscribers.findByActiveTrue();
		int sent = 0;
		for (NewsletterSubscriber s : recipients) {
			try {
				SimpleMailMessage msg = new SimpleMailMessage();
				msg.setFrom(from);
				msg.setTo(s.getEmail());
				msg.setSubject(subject);
				msg.setText(body);
				mailSender.send(msg);
				sent++;
			} catch (Exception e) {
				log.warn("Envoi newsletter impossible vers {} : {}", s.getEmail(), e.getMessage());
			}
		}
		NewsletterCampaign campaign = new NewsletterCampaign();
		campaign.setSubject(subject);
		campaign.setBody(body);
		campaign.setRecipientCount(sent);
		return campaigns.save(campaign);
	}
}
