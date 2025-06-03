package com.messagerie.backend.controller; // PAQUET CORRECT

import com.messagerie.backend.model.Message; // IMPORT CORRECT
import com.messagerie.backend.service.MessageService; // IMPORT CORRECT
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller; // IMPORTANT : Utilisez @Controller ici, pas @RestController

import java.time.LocalDateTime;

@Controller
public class WebSocketMessageController {

    @Autowired
    private MessageService messageService;

    // Cette annotation mappe les messages entrants avec la destination "/app/chat"
    // Le message envoyé par le client sur /app/chat sera routé vers cette méthode
    @MessageMapping("/chat")
    // Le résultat de cette méthode sera envoyé aux clients abonnés à "/topic/messages"
    @SendTo("/topic/messages")
    public Message sendMessage(Message message) {
        // Enregistrer le message dans la base de données avant de le diffuser
        message.setTimestamp(LocalDateTime.now()); // Assurez-vous que le timestamp est défini
        Message savedMessage = messageService.saveMessage(message);
        return savedMessage; // Le message sauvegardé est renvoyé aux abonnés
    }
}