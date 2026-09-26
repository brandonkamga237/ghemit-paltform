package com.ghemit.platform.media.application.port.out;

import java.io.Closeable;
import java.io.IOException;
import java.io.InputStream;

/** Objet lu depuis le stockage, à fermer après diffusion. */
public interface StoredObject extends Closeable {

	InputStream stream();

	@Override
	void close() throws IOException;
}
