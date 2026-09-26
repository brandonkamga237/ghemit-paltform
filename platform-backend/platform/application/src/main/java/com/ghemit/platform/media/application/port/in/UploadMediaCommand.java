package com.ghemit.platform.media.application.port.in;

import com.ghemit.platform.media.domain.MediaFolder;
import com.ghemit.platform.shared.application.BinaryContent;

public record UploadMediaCommand(BinaryContent content, MediaFolder folder) {
}
