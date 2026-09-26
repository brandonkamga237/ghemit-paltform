package com.ghemit.platform.newsletter.domain;

import java.util.Objects;
import java.util.UUID;

public record CampaignId(UUID value) {

	public CampaignId {
		Objects.requireNonNull(value, "L'identifiant de campagne est obligatoire");
	}

	public static CampaignId newId() {
		return new CampaignId(UUID.randomUUID());
	}

	public static CampaignId of(UUID value) {
		return new CampaignId(value);
	}

	@Override
	public String toString() {
		return value.toString();
	}
}
