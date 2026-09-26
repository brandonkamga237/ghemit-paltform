package com.ghemit.platform.inbox.application.port.in;

import java.util.Map;

public record SubmitCandidatureCommand(String program, Map<String, Object> form) {
}
