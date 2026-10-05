package com.ghemit.platform.newsletter.infrastructure.out.mail;

import com.ghemit.platform.newsletter.application.port.out.UnsubscribeTokens;
import com.ghemit.platform.shared.domain.EmailAddress;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Jeton de désinscription : {@code base64url(email).base64url(HMAC-SHA256)}.
 * Sans état — aucune colonne en base — et impossible à forger sans le secret.
 */
@Component
public class HmacUnsubscribeTokenSigner implements UnsubscribeTokens {

	private final byte[] secret;

	public HmacUnsubscribeTokenSigner(
			@Value("${app.newsletter.token-secret}") String secret) {
		this.secret = secret.getBytes(StandardCharsets.UTF_8);
	}

	@Override
	public String tokenFor(EmailAddress email) {
		String encoded = Base64.getUrlEncoder().withoutPadding()
				.encodeToString(email.value().getBytes(StandardCharsets.UTF_8));
		return encoded + "." + Base64.getUrlEncoder().withoutPadding().encodeToString(sign(email.value()));
	}

	@Override
	public Optional<EmailAddress> verify(String token) {
		int dot = token == null ? -1 : token.lastIndexOf('.');
		if (dot <= 0) {
			return Optional.empty();
		}
		try {
			String email = new String(Base64.getUrlDecoder().decode(token.substring(0, dot)),
					StandardCharsets.UTF_8);
			byte[] expected = sign(email);
			byte[] provided = Base64.getUrlDecoder().decode(token.substring(dot + 1));
			if (provided.length != expected.length) {
				return Optional.empty();
			}
			int diff = 0;
			for (int i = 0; i < expected.length; i++) {
				diff |= expected[i] ^ provided[i];
			}
			return diff == 0 ? EmailAddress.tryOf(email) : Optional.empty();
		} catch (IllegalArgumentException e) {
			return Optional.empty();
		}
	}

	private byte[] sign(String email) {
		try {
			Mac mac = Mac.getInstance("HmacSHA256");
			mac.init(new SecretKeySpec(secret, "HmacSHA256"));
			return mac.doFinal(email.getBytes(StandardCharsets.UTF_8));
		} catch (Exception e) {
			throw new IllegalStateException("Signature indisponible", e);
		}
	}
}
