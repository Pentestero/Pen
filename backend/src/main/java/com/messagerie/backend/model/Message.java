package com.messagerie.backend.model; // PAQUET CORRECT

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity // Indique que c'est une entité JPA
@Data // Génère getters, setters, toString, equals, hashCode (Lombok)
@NoArgsConstructor // Génère un constructeur sans arguments (Lombok)
@AllArgsConstructor // Génère un constructeur avec tous les arguments (Lombok)
public class Message {

    @Id // Indique la clé primaire
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-incrémentation
    private Long id;
    private String sender;
    private String content;
    private LocalDateTime timestamp; // Pour stocker la date et l'heure du message

    // Constructeur pour faciliter la création de messages entrants depuis le
    // frontend
    public Message(String sender, String content) {
        this.sender = sender;
        this.content = content;
        this.timestamp = LocalDateTime.now(); // Définit le timestamp au moment de la création
    }
}