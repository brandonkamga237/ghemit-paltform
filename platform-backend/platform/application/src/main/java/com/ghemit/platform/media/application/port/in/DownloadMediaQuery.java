package com.ghemit.platform.media.application.port.in;

import com.ghemit.platform.media.domain.ObjectKey;

/** Diffusion publique d'un média stocké. */
public interface DownloadMediaQuery {

	MediaDownload download(ObjectKey key);
}
