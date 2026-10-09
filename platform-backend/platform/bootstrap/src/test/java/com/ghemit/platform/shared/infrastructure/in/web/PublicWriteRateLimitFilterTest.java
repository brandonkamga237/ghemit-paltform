package com.ghemit.platform.shared.infrastructure.in.web;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class PublicWriteRateLimitFilterTest {

	@Test
	void le_limiteur_refuse_au_dela_du_quota_puis_accepte_a_nouveau_apres_la_fenetre() {
		MutableClock clock = new MutableClock();
		SlidingWindowRateLimiter limiter = new SlidingWindowRateLimiter(2, Duration.ofMinutes(10), clock);

		assertThat(limiter.tryAcquire("1.2.3.4")).isTrue();
		assertThat(limiter.tryAcquire("1.2.3.4")).isTrue();
		assertThat(limiter.tryAcquire("1.2.3.4")).isFalse();
		assertThat(limiter.tryAcquire("5.6.7.8")).isTrue();
		assertThat(limiter.retryAfterSeconds("1.2.3.4")).isEqualTo(600);

		clock.advance(Duration.ofMinutes(10));
		assertThat(limiter.tryAcquire("1.2.3.4")).isTrue();
	}

	@Test
	void le_filtre_repond_429_aux_envois_publics_en_exces() throws Exception {
		PublicWriteRateLimitFilter filter = new PublicWriteRateLimitFilter(1, Duration.ofMinutes(10));

		assertThat(post(filter, "/api/public/contact").getStatus()).isEqualTo(200);
		MockHttpServletResponse refused = post(filter, "/api/public/candidatures");
		assertThat(refused.getStatus()).isEqualTo(429);
		assertThat(refused.getHeader("Retry-After")).isNotBlank();
		assertThat(refused.getContentAsString()).contains("Trop d'envois");
	}

	@Test
	void le_filtre_ignore_les_lectures_et_l_administration() throws Exception {
		PublicWriteRateLimitFilter filter = new PublicWriteRateLimitFilter(1, Duration.ofMinutes(10));

		for (int i = 0; i < 3; i++) {
			MockHttpServletRequest read = new MockHttpServletRequest("GET", "/api/public/content");
			MockHttpServletResponse response = new MockHttpServletResponse();
			filter.doFilter(read, response, new MockFilterChain());
			assertThat(response.getStatus()).isEqualTo(200);
			assertThat(post(filter, "/api/admin/content/articles").getStatus()).isEqualTo(200);
		}
	}

	@Test
	void retient_l_adresse_ajoutee_par_le_proxy_et_non_celle_forgee_par_le_client() {
		MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/public/contact");
		request.addHeader("X-Forwarded-For", "6.6.6.6, 41.202.10.7");
		request.setRemoteAddr("172.18.0.5");

		assertThat(PublicWriteRateLimitFilter.clientAddress(request)).isEqualTo("41.202.10.7");
	}

	private static MockHttpServletResponse post(PublicWriteRateLimitFilter filter, String uri) throws Exception {
		MockHttpServletRequest request = new MockHttpServletRequest("POST", uri);
		request.setRemoteAddr("10.0.0.1");
		MockHttpServletResponse response = new MockHttpServletResponse();
		filter.doFilter(request, response, new MockFilterChain());
		return response;
	}

	private static final class MutableClock extends Clock {
		private Instant now = Instant.parse("2026-10-09T10:00:00Z");

		void advance(Duration d) {
			now = now.plus(d);
		}

		@Override
		public ZoneOffset getZone() {
			return ZoneOffset.UTC;
		}

		@Override
		public Clock withZone(java.time.ZoneId zone) {
			return this;
		}

		@Override
		public Instant instant() {
			return now;
		}
	}
}
