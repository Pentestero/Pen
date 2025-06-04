import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Client } from '@stomp/stompjs'; // Pour la connexion WebSocket STOMP
import SockJS from 'sockjs-client'; // Pour le fallback SockJS

function App() {
  const [messages, setMessages] = useState([]); // État pour stocker les messages reçus
  const [newMessageContent, setNewMessageContent] = useState(''); // État pour le contenu du message à envoyer
  const [username, setUsername] = useState('Anonyme'); // État pour le nom d'utilisateur (peut être changé)
  const [isConnected, setIsConnected] = useState(false); // Nouvel état pour suivre l'état de la connexion STOMP
  const stompClient = useRef(null); // useRef pour maintenir la référence au client STOMP à travers les rendus
  const messagesEndRef = useRef(null); // useRef pour faire défiler automatiquement la liste des messages

  // useEffect s'exécute au montage du composant (équivalent à componentDidMount)
  // et gère la connexion WebSocket et le chargement de l'historique.
  useEffect(() => {
    // 1. Charger les messages historiques depuis l'API REST du backend
    // Une requête GET est envoyée au endpoint '/api/messages' de notre backend Spring Boot.
    fetch('http://localhost:8080/api/messages')
      .then(response => {
        // Vérifie si la réponse HTTP est OK (statut 200)
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return response.json(); // Parse la réponse en JSON
      })
      .then(data => {
        // Met à jour l'état `messages` avec les données reçues.
        setMessages(data);
        scrollToBottom(); // Fait défiler vers le bas après le chargement initial des messages
      })
      .catch(error => console.error("Erreur lors du chargement des messages historiques :", error)); // Gère les erreurs

    // 2. Initialiser la connexion WebSocket STOMP
    // Crée une instance de SockJS pointant vers l'endpoint WebSocket de notre backend.
    const socket = new SockJS('http://localhost:8080/ws');
    
    // Crée un client STOMP. On utilise webSocketFactory pour intégrer SockJS.
    stompClient.current = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log(str); // Affiche les logs internes du client STOMP dans la console du navigateur
      },
      reconnectDelay: 5000, // Tente de se reconnecter toutes les 5 secondes en cas de déconnexion
      heartbeatIncoming: 4000, // Attente max pour les heartbeats entrants du serveur
      heartbeatOutgoing: 4000, // Fréquence d'envoi des heartbeats au serveur
    });

    // Configuration du callback à l'établissement de la connexion
    stompClient.current.onConnect = (frame) => {
      console.log('Connecté au broker STOMP: ' + frame);
      setIsConnected(true); // Met à jour l'état de connexion à true

      // S'abonner à la destination '/topic/messages'.
      // Tous les messages envoyés à cette destination par le backend seront reçus ici.
      stompClient.current.subscribe('/topic/messages', (message) => {
        // Quand un nouveau message est reçu via WebSocket, on le parse et l'ajoute à l'état.
        const receivedMessage = JSON.parse(message.body);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]); // Ajoute le nouveau message aux messages existants
      });
    };

    // Configuration du callback en cas d'erreur STOMP
    stompClient.current.onStompError = (frame) => {
      console.error('Erreur STOMP: ' + frame.headers['message']);
      console.error('Détails: ' + frame.body);
      setIsConnected(false); // Met à jour l'état de connexion à false en cas d'erreur
    };

    // Configuration du callback en cas de déconnexion
    stompClient.current.onDisconnect = () => {
      console.log('Déconnecté du broker STOMP.');
      setIsConnected(false); // Met à jour l'état de connexion à false en cas de déconnexion
    };

    // Active la connexion WebSocket
    stompClient.current.activate();

    // Fonction de nettoyage à l'heure du démontage du composant (équivalent à componentWillUnmount)
    return () => {
      // Si le client STOMP existe et est connecté, il est désactivé proprement.
      if (stompClient.current && stompClient.current.connected) {
        stompClient.current.deactivate();
        console.log('Déconnecté du broker STOMP.');
      }
    };
  }, []); // Le tableau de dépendances vide [] signifie que cet effet s'exécute une seule fois au montage

  // useEffect pour faire défiler la liste des messages vers le bas chaque fois que `messages` change
  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Cet effet s'exécute chaque fois que le tableau `messages` est mis à jour

  // Fonction utilitaire pour faire défiler la vue vers le bas
  const scrollToBottom = () => {
    // `scrollIntoView` fait défiler l'élément référencé dans la vue.
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); // Comportement doux pour une animation de défilement
  };

  // Gère l'envoi d'un message lorsque le formulaire est soumis
  const handleSendMessage = (e) => {
    e.preventDefault(); // Empêche le comportement par défaut du formulaire (rechargement de la page)
    
    // Vérifie que la connexion STOMP est établie AVANT d'essayer de publier
    if (!isConnected) {
      console.warn("Impossible d'envoyer le message : pas de connexion STOMP établie.");
      // Vous pouvez afficher un message à l'utilisateur ici
      return;
    }

    // Vérifie que le contenu du message et le nom d'utilisateur ne sont pas vides
    if (newMessageContent.trim() && username.trim()) {
      const chatMessage = {
        sender: username, // Le nom d'utilisateur actuel
        content: newMessageContent.trim(), // Le contenu du message, avec les espaces blancs aux extrémités retirés
      };
      
      // Envoie le message au backend via WebSocket en utilisant le client STOMP.
      // La destination '/app/chat' correspond à l'annotation @MessageMapping dans le backend.
      stompClient.current.publish({
        destination: '/app/chat',
        body: JSON.stringify(chatMessage), // Convertit l'objet message en une chaîne JSON
      });
      
      setNewMessageContent(''); // Vide le champ de saisie du message après l'envoi
      // REMARQUE IMPORTANTE : Nous avons retiré l'ajout local du message ici.
      // Le message sera ajouté à la liste 'messages' UNIQUEMENT quand il sera reçu
      // via l'abonnement WebSocket du serveur. Cela évite les doublons.
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Ma Messagerie Simple</h1>
      </header>
      <div className="chat-container">
        <div className="messages-list">
          {messages.length === 0 ? (
            <p className="no-messages-text">Pas encore de messages. Soyez le premier à envoyer un message !</p>
          ) : (
            // Parcours le tableau `messages` et rend chaque message
            messages.map((msg, index) => (
              // Utilise `msg.id` comme clé si disponible (vient de la BDD), sinon `index` (moins idéal mais fonctionne)
              <div key={msg.id || index} className={`message ${msg.sender === username ? 'my-message' : 'other-message'}`}>
                <div className="message-header">
                  <span className="sender">{msg.sender}</span>
                  {/* Affiche le timestamp formaté si disponible */}
                  <span className="timestamp">{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                </div>
                <div className="message-content">{msg.content}</div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} /> {/* Cet élément est la cible du défilement automatique */}
        </div>
        <form onSubmit={handleSendMessage} className="message-input-form">
          {/* Champ pour le nom d'utilisateur */}
          <input
            type="text"
            placeholder="Votre nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="username-input"
            required // Rends le champ obligatoire
          />
          {/* Champ pour le contenu du message */}
          <input
            type="text"
            placeholder={isConnected ? "Écrivez votre message..." : "Connexion au serveur..."}
            value={newMessageContent}
            onChange={(e) => setNewMessageContent(e.target.value)}
            className="message-input"
            disabled={!isConnected} // Désactive le champ si non connecté
            required // Rends le champ obligatoire
          />
          {/* Bouton d'envoi du message */}
          <button type="submit" className="send-button" disabled={!isConnected}>
            {isConnected ? "Envoyer" : "Connexion..."}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
