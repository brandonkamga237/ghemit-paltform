package com.ghemit.platform.inbox;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ContactMessageRepository
		extends JpaRepository<ContactMessage, UUID>, JpaSpecificationExecutor<ContactMessage> {
}
