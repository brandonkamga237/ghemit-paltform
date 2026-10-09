package com.ghemit.platform.shared.infrastructure.in.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Clock;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Limite les envois publics (contact, candidatures, CV, newsletter) par adresse
 * IP : un script ne peut plus remplir la base ou le stockage. Les lectures
 * publiques et l'administration ne sont pas concernées.
 * <p>
 * C'est une protection technique, hors du domaine : elle répond directement
 * 429 sans passer par {@link RestExceptionHandler}.
 */
@Component
public class PublicWriteRateLimitFilter extends OncePerRequestFilter {

	private static final String PUBLIC_PREFIX = "/api/public/";

	private final SlidingWindowRateLimiter limiter;

	public PublicWriteRateLimitFilter(
			@Value("${app.rate-limit.public-writes.max-requests:20}") int maxRequests,
			@Value("${app.rate-limit.public-writes.window:PT10M}") Duration window) {
		this.limiter = new SlidingWindowRateLimiter(maxRequests, window, Clock.systemUTC());
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		return !"POST".equalsIgnoreCase(request.getMethod())
				|| !request.getRequestURI().startsWith(PUBLIC_PREFIX);
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
			FilterChain chain) throws ServletException, IOException {
		String client = clientAddress(request);
		if (limiter.tryAcquire(client)) {
			chain.doFilter(request, response);
			return;
		}
		response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
		response.setHeader("Retry-After", String.valueOf(limiter.retryAfterSeconds(client)));
		response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write("{\"status\":429,\"title\":\"Too Many Requests\","
				+ "\"detail\":\"Trop d'envois depuis cette adresse. Réessayez dans quelques minutes.\"}");
	}

	/**
	 * Derrière Traefik, l'adresse réelle est la dernière entrée de
	 * X-Forwarded-For (celle ajoutée par le proxy) : les entrées précédentes
	 * peuvent être forgées par le client.
	 */
	static String clientAddress(HttpServletRequest request) {
		String forwarded = request.getHeader("X-Forwarded-For");
		if (forwarded != null && !forwarded.isBlank()) {
			String[] parts = forwarded.split(",");
			String last = parts[parts.length - 1].trim();
			if (!last.isEmpty()) {
				return last;
			}
		}
		return request.getRemoteAddr();
	}
}
