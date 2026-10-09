package com.ghemit.platform.shared.infrastructure.in.web;

import java.time.Clock;
import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Limiteur à fenêtre glissante, en mémoire : au plus {@code maxRequests}
 * acceptées par clé (adresse IP) sur {@code window}. Suffisant pour une seule
 * instance de l'API ; à remplacer par un stockage partagé si l'API est
 * dupliquée.
 */
public class SlidingWindowRateLimiter {

	/** Au-delà, les clés inactives sont purgées pour borner la mémoire. */
	private static final int CLEANUP_THRESHOLD = 10_000;

	private final int maxRequests;
	private final long windowMillis;
	private final Clock clock;
	private final Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();

	public SlidingWindowRateLimiter(int maxRequests, Duration window, Clock clock) {
		this.maxRequests = maxRequests;
		this.windowMillis = window.toMillis();
		this.clock = clock;
	}

	/** Enregistre une tentative ; {@code false} si la limite est atteinte. */
	public boolean tryAcquire(String key) {
		long now = clock.millis();
		if (hits.size() > CLEANUP_THRESHOLD) {
			hits.entrySet().removeIf(e -> isStale(e.getValue(), now));
		}
		Deque<Long> times = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
		synchronized (times) {
			while (!times.isEmpty() && times.peekFirst() <= now - windowMillis) {
				times.pollFirst();
			}
			if (times.size() >= maxRequests) {
				return false;
			}
			times.addLast(now);
			return true;
		}
	}

	/** Secondes avant qu'une nouvelle tentative soit acceptée pour cette clé (au moins 1). */
	public long retryAfterSeconds(String key) {
		Deque<Long> times = hits.get(key);
		if (times == null) {
			return 1;
		}
		synchronized (times) {
			Long oldest = times.peekFirst();
			long wait = oldest == null ? 0 : oldest + windowMillis - clock.millis();
			return Math.max(1, (wait + 999) / 1000);
		}
	}

	private boolean isStale(Deque<Long> times, long now) {
		synchronized (times) {
			Long last = times.peekLast();
			return last == null || last <= now - windowMillis;
		}
	}
}
