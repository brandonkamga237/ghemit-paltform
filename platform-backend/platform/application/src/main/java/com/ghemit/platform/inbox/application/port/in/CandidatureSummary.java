package com.ghemit.platform.inbox.application.port.in;

import java.util.Map;

/** Compteurs affichés sur le tableau de bord du back office. */
public record CandidatureSummary(long total, long unread, Map<String, Long> byProgram,
		Map<String, Long> byStatus) {
}
