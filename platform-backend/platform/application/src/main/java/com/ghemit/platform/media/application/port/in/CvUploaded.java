package com.ghemit.platform.media.application.port.in;

import com.ghemit.platform.media.domain.ObjectKey;

/** Résultat du dépôt d'un CV : de quoi référencer le fichier dans la candidature. */
public record CvUploaded(ObjectKey objectKey, String filename) {
}
