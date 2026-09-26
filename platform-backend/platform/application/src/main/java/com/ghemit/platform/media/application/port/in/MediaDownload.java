package com.ghemit.platform.media.application.port.in;

import com.ghemit.platform.media.application.port.out.StoredObject;

/** Contenu d'un média prêt à être diffusé. */
public record MediaDownload(String contentType, StoredObject object) {
}
