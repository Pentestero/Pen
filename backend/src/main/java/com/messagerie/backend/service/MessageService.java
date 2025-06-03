package com.messagerie.backend.service; // PAQUET CORRECT

import com.messagerie.backend.model.Message; // IMPORT CORRECT
import com.messagerie.backend.repository.MessageRepository; // IMPORT CORRECT
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.time.LocalDateTime;

@Service // Indique que c'est un composant de service
public class MessageService {

    @Autowired // Injecte le MessageRepository
    private MessageRepository messageRepository;

    public List<Message> getAllMessages() {
        return messageRepository.findAllByOrderByTimestampAsc();
    }

    public Message saveMessage(Message message) {
        if (message.getTimestamp() == null) {
            message.setTimestamp(LocalDateTime.now()); // Assurez-vous qu'un timestamp est toujours défini
        }
        return messageRepository.save(message);
    }
}