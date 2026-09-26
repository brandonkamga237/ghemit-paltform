package com.ghemit.platform.newsletter.application.port.in;

/**
 * @param name   nom de l'abonné, facultatif
 * @param source origine de l'inscription (« footer », « contact », « candidature:paei »…)
 */
public record SubscribeCommand(String email, String name, String source) {
}
