package com.ghemit.platform.shared.application;

import java.io.InputStream;

/**
 * Fichier entrant, indépendant du transport (multipart HTTP, tâche batch…).
 * Le flux est consommé une seule fois par l'adaptateur de stockage.
 */
public record BinaryContent(String filename, String contentType, long size, InputStream stream) {
}
