package com.messagerie.backend.repository; // PAQUET CORRECT

import com.messagerie.backend.model.Message; // IMPORT CORRECT
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository // Indique que c'est un composant de persistance
public interface MessageRepository extends JpaRepository<Message, Long> {
    // JpaRepository fournit des méthodes CRUD de base (save, findById, findAll, delete, etc.)
    List<Message> findAllByOrderByTimestampAsc(); // Récupérer tous les messages triés par date
}