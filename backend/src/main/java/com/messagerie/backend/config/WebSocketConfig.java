package com.messagerie.backend.config; // PAQUET CORRECT

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration // Indique que c'est une classe de configuration
@EnableWebSocketMessageBroker // Active la gestion des messages WebSocket via STOMP
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Active un simple broker de messages basé sur la mémoire
        // Les messages destinés aux préfixes "/topic" ou "/queue" seront routés vers le broker
        config.enableSimpleBroker("/topic");
        // Définit le préfixe pour les messages destinés aux méthodes annotées @MessageMapping
        // Par exemple, un message envoyé à /app/chat sera routé vers sendMessage()
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Enregistre l'endpoint "/ws" (ou "/websocket")
        // Les clients WebSocket se connecteront à cet endpoint
        // .withSockJS() ajoute un support pour SockJS, utile pour la compatibilité avec les anciens navigateurs
        // et le fallback si les WebSockets ne sont pas disponibles.
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:3000") // Permet les connexions depuis votre frontend React
                .withSockJS();
    }
}