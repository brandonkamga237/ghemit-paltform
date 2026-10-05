package com.ghemit.platform.newsletter.application.port.in;

import java.util.List;

public record SendCampaignCommand(String subject, String body, List<String> audience) {
}
