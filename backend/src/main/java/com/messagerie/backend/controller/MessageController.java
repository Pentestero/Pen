package com.messagerie.backend.controller; // PAQUET CORRECT

import com.messagerie.backend.model.Message; // IMPORT CORRECT
import com.messagerie.backend.service.MessageService; // IMPORT CORRECT
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController // Indique que c'est un contrôleur REST
@RequestMapping("/api/messages") // Chemin de base pour les requêtes REST
@CrossOrigin(origins = "http://localhost:3000") // Permet les requêtes depuis votre frontend React
public class MessageController {

    @Autowired
    private MessageService messageService;

    @GetMapping
    public ResponseEntity<List<Message>> getAllMessages() {
        List<Message> messages = messageService.getAllMessages();
        return new ResponseEntity<>(messages, HttpStatus.OK);
    }
}