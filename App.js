// Importation des composants nécessaires de React Native et des hooks de React
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { useState, useEffect, useRef } from 'react';

// Définition des constantes pour les paramètres du jeu
const MAX_NUMBER = 50; // La constante "MAX_NUMBER" définit 50 comme grandeur maximum d'un nombre. Cela signifie que les nombres générés aléatoirement seront compris entre 0 et 49.
const EASY_TIME = 10; // Cette constante "EASY_TIME" définit 10 comme temps de réponse pour le mode "facile". Les joueurs auront 10 secondes pour répondre.
const HARD_TIME = 5; // Cette constante "HARD_TIME" définit 5 comme temps de réponse pour le mode "difficile". Les joueurs auront seulement 5 secondes pour répondre.
const MAX_LIVES = 3; // Cette constante "MAX_LIVES" définit le nombre maximum de vies au départ. Les joueurs commenceront avec 3 vies.
const EASY_POINTS = 5; // Cette constante "EASY_POINTS" définit le nombre de points par réponse correcte en mode "facile". Chaque bonne réponse en mode facile rapporte 5 points.
const HARD_POINTS = 10; // Cette constante "HARD_POINTS" définit le nombre de points par réponse correcte en mode "difficile". Chaque bonne réponse en mode difficile rapporte 10 points.

// Fonction pour générer un nombre entier aléatoire entre 0 et max - 1
const rndNumber = (max) => Math.floor(Math.random() * max);

// Fonction pour formater le temps en mm:ss
const formatTime = (time) => (time < 10 ? `00 : 0${time}` : `00 : ${time}`);

// Composant principal de l'application
export default function App() {
  // Initialisation des états avec useState
  const [numberOne, setNumberOne] = useState(rndNumber(MAX_NUMBER));  // Initialisation de numberOne avec un nombre aléatoire entre 0 et 49. Ce nombre sera utilisé dans les calculs.
  const [numberTwo, setNumberTwo] = useState(rndNumber(MAX_NUMBER));   // Initialisation de numberTwo avec un nombre aléatoire entre 0 et 49. Ce nombre sera également utilisé dans les calculs.
  
  // Initialisation de l'état numberThree avec la valeur null. 
  // numberThree est utilisé pour stocker un troisième nombre, 
  // et setNumberThree est la fonction utilisée pour mettre à jour cette valeur.
  const [numberThree, setNumberThree] = useState(null); // Initialisation de l'état numberThree avec la valeur null. Ce nombre sera utilisé uniquement en mode difficile.
  const [solution, setSolution] = useState(0); // Initialisation de l'état solution avec la valeur 0. La solution est la somme des nombres générés.
  const [userAnswer, setUserAnswer] = useState(''); // Initialisation de l'état userAnswer avec une chaîne vide. Cet état stocke la réponse saisie par l'utilisateur.
  const [msg, setMsg] = useState(''); // Initialisation de l'état msg avec une chaîne vide. Cet état stocke les messages à afficher à l'utilisateur.

  const [timeLeft, setTimeLeft] = useState(EASY_TIME); // Initialisation de l'état timeLeft avec EASY_TIME. Cet état stocke le temps restant pour répondre.
  const [btnEnabled, setBtnEnabled] = useState(true); // Initialisation de l'état btnEnabled avec true. Cet état détermine si le bouton de soumission est activé ou désactivé.
  const [lives, setLives] = useState(MAX_LIVES); // Initialisation de l'état lives avec MAX_LIVES. Cet état stocke le nombre de vies restantes.
  const [score, setScore] = useState(0); // Initialisation de l'état score avec 0. Cet état stocke le score actuel du joueur.

  const [difficulty, setDifficulty] = useState('easy'); // Initialisation de l'état difficulty avec 'easy'. Cet état détermine le niveau de difficulté actuel.
  const [gameOver, setGameOver] = useState(false); // Initialisation de l'état gameOver avec false. Cet état détermine si le jeu est terminé.
  const [canChangeDifficulty, setCanChangeDifficulty] = useState(true); // Initialisation de l'état canChangeDifficulty avec true. Cet état détermine si la difficulté peut être changée.

  const timerRef = useRef(null); // Utilisation de useRef pour stocker une référence au timer. Cela permet de démarrer et d'arrêter le timer.

  // useEffect pour mettre à jour la solution en fonction des nombres et de la difficulté
  useEffect(() => {
    if (difficulty === 'hard') {
      setSolution(() => numberOne + numberTwo + (numberThree || 0)); // En mode difficile, la solution est la somme de numberOne, numberTwo et numberThree.
    } else {
      setSolution(() => numberOne + numberTwo); // En mode facile, la solution est la somme de numberOne et numberTwo.
    }
  }, [numberOne, numberTwo, numberThree, difficulty]); // Ce useEffect est déclenché chaque fois que numberOne, numberTwo, numberThree ou difficulty change.

  // useEffect pour démarrer le timer au montage du composant
  useEffect(() => {
    startTimer(); // Démarre le timer lorsque le composant est monté.
    return () => clearInterval(timerRef.current); // Nettoie le timer lorsque le composant est démonté.
  }, []); // Ce useEffect est déclenché une seule fois, au montage du composant.

  // useEffect pour gérer le timeout lorsque le temps est écoulé
  useEffect(() => {
    if (timeLeft === 0) {
      handleTimeOut(); // Appelle handleTimeOut lorsque le temps est écoulé.
    }
  }, [timeLeft]); // Ce useEffect est déclenché chaque fois que timeLeft change.

  // Fonction pour démarrer le timer
  const startTimer = () => {
    clearInterval(timerRef.current); // Arrête le timer actuel, s'il y en a un.
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0)); // Décrémente le temps restant toutes les secondes, jusqu'à ce qu'il atteigne 0.
    }, 1000); // Intervalle de 1 seconde.
  };

  // Fonction pour gérer le timeout
  const handleTimeOut = () => {
    setLives((prevLives) => {
      const newLives = Math.max(prevLives - 1, 0); // Décrémente le nombre de vies restantes, jusqu'à un minimum de 0.
      if (newLives === 0) {
        setMsg(`Game Over! La réponse était ${solution}`); // Affiche un message de fin de jeu si le joueur n'a plus de vies.
        setBtnEnabled(false); // Désactive le bouton de soumission.
        setGameOver(true); // Indique que le jeu est terminé.
      } else {
        setMsg(`Temps écoulé, la bonne réponse était ${solution}. Il vous reste ${newLives} vies.`); // Affiche un message indiquant que le temps est écoulé et la réponse correcte.
        setTimeout(() => {
          handleNextQuestion(); // Passe automatiquement à une nouvelle question après un court délai.
        }, 2000); // Délai de 2 secondes avant de passer à la nouvelle question.
      }
      return newLives; // Retourne le nouveau nombre de vies.
    });
  };

  // Fonction pour démarrer une nouvelle partie
  const handleNewGame = () => {
    setNumberOne(rndNumber(MAX_NUMBER)); // Génère un nouveau nombre aléatoire pour numberOne.
    setNumberTwo(rndNumber(MAX_NUMBER)); // Génère un nouveau nombre aléatoire pour numberTwo.
    if (difficulty === 'hard') setNumberThree(rndNumber(MAX_NUMBER)); // Génère un nouveau nombre aléatoire pour numberThree si la difficulté est "hard".
    setUserAnswer(''); // Réinitialise la réponse de l'utilisateur.
    setMsg(''); // Réinitialise le message.
    setTimeLeft(difficulty === 'hard' ? HARD_TIME : EASY_TIME); // Réinitialise le temps restant en fonction de la difficulté.
    setBtnEnabled(true); // Active le bouton de soumission.
    setLives(MAX_LIVES); // Réinitialise le nombre de vies.
    setScore(0); // Réinitialise le score.
    setGameOver(false); // Indique que le jeu n'est plus terminé.
    setCanChangeDifficulty(true); // Permet de changer la difficulté.
    startTimer(); // Démarre le timer.
  };

  // Fonction pour passer à la question suivante
  const handleNextQuestion = () => {
    setNumberOne(rndNumber(MAX_NUMBER)); // Génère un nouveau nombre aléatoire pour numberOne.
    setNumberTwo(rndNumber(MAX_NUMBER)); // Génère un nouveau nombre aléatoire pour numberTwo.
    if (difficulty === 'hard') setNumberThree(rndNumber(MAX_NUMBER)); // Génère un nouveau nombre aléatoire pour numberThree si la difficulté est "hard".
    setUserAnswer(''); // Réinitialise la réponse de l'utilisateur.
    setMsg(''); // Réinitialise le message.
    setTimeLeft(difficulty === 'hard' ? HARD_TIME : EASY_TIME); // Réinitialise le temps restant en fonction de la difficulté.
    setBtnEnabled(true); // Active le bouton de soumission.
    setCanChangeDifficulty(true); // Permet de changer la difficulté.
    startTimer(); // Démarre le timer.
  };

  // Fonction pour soumettre la réponse de l'utilisateur
  const handleSubmit = () => {
    setCanChangeDifficulty(false); // Empêche de changer la difficulté jusqu'à la prochaine question.
    if (parseInt(userAnswer) === solution) { // Vérifie si la réponse de l'utilisateur est correcte.
      clearInterval(timerRef.current); // Arrête le timer.
      setMsg(`Bravo continue c'était bien le nombre ${solution}`); // Affiche un message de félicitations.
      setScore((prevScore) => prevScore + (difficulty === 'hard' ? HARD_POINTS : EASY_POINTS)); // Augmente le score en fonction de la difficulté.
      setTimeout(() => {
        handleNextQuestion(); // Passe automatiquement à une nouvelle question après un court délai.
      }, 2000); // Délai de 2 secondes avant de passer à la nouvelle question.
    } else {
      setLives((prevLives) => {
        const newLives = Math.max(prevLives - 1, 0); // Décrémente le nombre de vies restantes, jusqu'à un minimum de 0.
        if (newLives === 0) {
          setMsg(`Game Over! La réponse était ${solution}`); // Affiche un message de fin de jeu si le joueur n'a plus de vies.
          setBtnEnabled(false); // Désactive le bouton de soumission.
          setGameOver(true); // Indique que le jeu est terminé.
        } else {
          setMsg(`Mauvaise réponse, la réponse était ${solution}. Il vous reste ${newLives} vies.`); // Affiche un message indiquant que la réponse est incorrecte et la réponse correcte.
          setTimeout(() => {
            handleNextQuestion(); // Passe automatiquement à une nouvelle question après un court délai.
          }, 2000); // Délai de 2 secondes avant de passer à la nouvelle question.
        }
        return newLives; // Retourne le nouveau nombre de vies.
      });
    }
  };

  // Fonction pour changer la difficulté
  const handleDifficultyChange = (level) => {
    if (canChangeDifficulty) { // Vérifie si la difficulté peut être changée.
      setDifficulty(level); // Met à jour la difficulté.
      setTimeLeft(level === 'hard' ? HARD_TIME : EASY_TIME); // Met à jour le temps restant en fonction de la difficulté.
      if (level === 'hard') {
        setNumberThree(rndNumber(MAX_NUMBER)); // Génère un nouveau nombre aléatoire pour numberThree si la difficulté est "hard".
      } else {
        setNumberThree(null); // Réinitialise numberThree à null si la difficulté est "easy".
      }
      handleNextQuestion(); // Passe à la question suivante.
    }
  };

  // Fonction pour quitter le jeu et rediriger vers Google
  const handleExit = () => {
    window.location.href = "https://www.google.com"; // Redirige vers la page de recherche de Google.
  };

  return (
    <View style={styles.container}>
      {/* Conteneur principal :
          - Utilisé pour organiser tous les éléments du jeu.
          - Style `styles.container` :
            - Centre horizontalement et verticalement les enfants.
            - Ajoute un arrière-plan uniforme et un padding. */}
      
      {/* Chronomètre */}
      <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
      {/* - Affiche le temps restant au format `00 : ss`.
          - `styles.timer` applique une police large, en gras, avec une couleur sombre pour une meilleure visibilité.
          - `formatTime(timeLeft)` transforme les secondes en une chaîne lisible. */}
      
      {/* Question mathématique */}
      <Text style={styles.question}>
        {numberOne} + {numberTwo}
        {numberThree !== null ? ` + ${numberThree}` : ''} =
      </Text>
      {/* - La question affiche dynamiquement les nombres générés (2 ou 3 selon la difficulté).
          - Si `numberThree` n'est pas nul (mode difficile), il est inclus dans l'équation.
          - Style `styles.question` assure une visibilité optimale avec une police moyenne et en gras. */}
      
      {/* Champ de saisie pour la réponse utilisateur */}
      <TextInput
        style={styles.input}
        placeholder="Entrez votre réponse"
        keyboardType="numeric"
        onChangeText={setUserAnswer}
        value={userAnswer}
      />
      {/* - Capture la réponse utilisateur via un clavier numérique.
          - `placeholder` guide l'utilisateur en indiquant l'action attendue.
          - `onChangeText={setUserAnswer}` met à jour l'état `userAnswer` en temps réel.
          - Style `styles.input` :
            - Bordure subtile et coins arrondis pour une interface moderne.
            - Fond blanc pour différencier le champ des autres éléments. */}
      
      {/* Bouton "Soumettre" */}
      <TouchableOpacity
        style={[styles.button, btnEnabled ? styles.buttonActive : styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!btnEnabled}
      >
        <Text style={styles.buttonText}>Soumettre</Text>
      </TouchableOpacity>
      {/* - Permet à l'utilisateur de soumettre sa réponse.
          - Style dynamique :
            - Bouton actif (`styles.buttonActive`) : fond bleu.
            - Bouton désactivé (`styles.buttonDisabled`) : fond gris clair.
          - Désactivé (`disabled={!btnEnabled}`) si l'utilisateur ne peut pas encore interagir.
          - `handleSubmit` vérifie si la réponse est correcte et met à jour le jeu. */}
      
      {/* Boutons de sélection de difficulté */}
      <View style={styles.difficultyButtons}>
        {/* Conteneur pour aligner les boutons horizontalement */}
        
        {/* Bouton "Facile" */}
        <TouchableOpacity
          style={styles.difficultyButton}
          onPress={() => handleDifficultyChange('easy')}
          disabled={!canChangeDifficulty}
        >
          <Image
            source={require('./assets/easy.png')}
            style={difficulty === 'easy' ? styles.easyActive : styles.easyInactive}
          />
        </TouchableOpacity>
        {/* - Appelle `handleDifficultyChange('easy')` pour passer en mode facile.
            - Bouton désactivé si `canChangeDifficulty` est faux.
            - Style de l'image change selon la difficulté active. */}
  
        {/* Bouton "Difficile" */}
        <TouchableOpacity
          style={styles.difficultyButton}
          onPress={() => handleDifficultyChange('hard')}
          disabled={!canChangeDifficulty}
        >
          <Image
            source={require('./assets/hard.png')}
            style={difficulty === 'hard' ? styles.hardActive : styles.hardInactive}
          />
        </TouchableOpacity>
        {/* - Identique au bouton "Facile", mais pour passer en mode difficile. */}
      </View>
      
      {/* Messages et statistiques */}
      <Text style={styles.message}>{msg}</Text>
      {/* - Affiche des messages contextuels (succès, échec, temps écoulé).
          - `styles.message` garantit une lisibilité optimale avec une police claire et bien espacée. */}
      
      <Text style={styles.lives}>Vies restantes: {lives}</Text>
      {/* - Affiche le nombre de vies actuelles du joueur.
          - `styles.lives` applique un style simple et cohérent avec les autres statistiques. */}
      
      <Text style={styles.score}>Score: {score}</Text>
      {/* - Affiche le score accumulé par le joueur.
          - Style similaire à celui des vies pour une cohérence visuelle. */}
      
      {/* Menu de fin de partie */}
      {gameOver && (
        <View style={styles.gameOverMenu}>
          <Text style={styles.gameOverText}>Commencer une nouvelle partie ?</Text>
          {/* - Affiché uniquement lorsque `gameOver` est `true`.
              - Invite le joueur à recommencer ou quitter le jeu. */}
  
          {/* Bouton "Oui" pour recommencer */}
          <TouchableOpacity style={styles.gameOverButton} onPress={handleNewGame}>
            <Image
              source={require('./assets/yes.png')}
              style={styles.gameOverButtonImage}
            />
          </TouchableOpacity>
          {/* - Appelle `handleNewGame` pour réinitialiser les états et relancer une nouvelle partie. */}
  
          {/* Bouton "Non" pour quitter */}
          <TouchableOpacity style={styles.gameOverButton} onPress={handleExit}>
            <Image
              source={require('./assets/no.png')}
              style={styles.gameOverButtonImage}
            />
          </TouchableOpacity>
          {/* - Appelle `handleExit` pour quitter le jeu (ouvre un lien externe). */}
        </View>
      )}
    </View>
  );
  
}

const styles = StyleSheet.create({
  // Conteneur principal de l'application
  container: {
    flex: 1, 
    // Permet au conteneur d'occuper tout l'espace disponible dans son parent.
    // `flex: 1` est une propriété Flexbox qui indique que le conteneur doit prendre 
    // tout l'espace vertical disponible (s'étendre de haut en bas).

    backgroundColor: '#f4f4f4', 
    // Définit la couleur d'arrière-plan du conteneur. 
    // Ici, un gris clair (#f4f4f4) est choisi pour offrir une esthétique neutre et non agressive.

    alignItems: 'center', 
    // Centre tous les éléments enfants horizontalement dans le conteneur. 
    // Cela signifie que tous les éléments seront alignés au centre sur l'axe transversal.

    justifyContent: 'center', 
    // Centre tous les éléments enfants verticalement dans le conteneur. 
    // Tous les éléments sont alignés au milieu de l'écran sur l'axe principal.

    padding: 20, 
    // Ajoute un espace interne de 20 pixels sur tous les côtés. 
    // Cela empêche les éléments de toucher les bords du conteneur et améliore la lisibilité.
  },

  // Style pour l'affichage du chronomètre
  timer: {
    fontSize: 40, 
    // Définit une taille de police importante pour rendre le chronomètre bien visible.

    fontWeight: 'bold', 
    // Met le texte en gras pour lui donner plus d'importance.

    color: '#333', 
    // Définit une couleur de texte gris foncé (#333), idéale pour un bon contraste sur un fond clair.

    marginBottom: 20, 
    // Ajoute un espace de 20 pixels en dessous du chronomètre 
    // pour le séparer visuellement des autres éléments.
  },

  // Style pour les questions affichées
  question: {
    fontSize: 24, 
    // Utilise une taille de police moyenne, suffisamment grande pour que la question soit lisible.

    fontWeight: 'bold', 
    // Rend le texte en gras pour indiquer que c'est une information importante.

    marginBottom: 20, 
    // Ajoute un espacement de 20 pixels en dessous pour éviter que la question 
    // ne soit trop proche des autres éléments.

    color: '#555', 
    // Utilise une couleur gris moyen (#555) pour différencier légèrement la question 
    // du chronomètre, tout en restant lisible.
  },

  // Style pour le champ de saisie de la réponse
  input: {
    borderWidth: 1, 
    // Ajoute une bordure d'une épaisseur de 1 pixel autour du champ de saisie.

    borderColor: '#ccc', 
    // Utilise une couleur gris clair pour la bordure, 
    // ce qui la rend visible sans être trop agressive.

    borderRadius: 5, 
    // Arrondit les coins de la bordure avec un rayon de 5 pixels pour un look moderne.

    padding: 10, 
    // Ajoute un espace interne de 10 pixels pour que le texte saisi ne touche pas la bordure.

    fontSize: 18, 
    // Définit une taille de police de 18 pixels, adaptée à la saisie d'informations.

    width: '80%', 
    // Le champ occupe 80 % de la largeur de l'écran pour s'adapter à différents appareils.

    marginBottom: 20, 
    // Ajoute un espace de 20 pixels sous le champ pour le séparer des autres éléments.

    backgroundColor: '#fff', 
    // Ajoute un fond blanc pour différencier clairement le champ de saisie des autres éléments.
  },

  // Style générique pour les boutons
  button: {
    paddingVertical: 15, 
    // Ajoute un espace interne vertical de 15 pixels pour rendre le bouton plus haut.

    paddingHorizontal: 30, 
    // Ajoute un espace interne horizontal de 30 pixels pour que le bouton soit plus large.

    borderRadius: 5, 
    // Arrondit légèrement les coins du bouton avec un rayon de 5 pixels.

    marginBottom: 10, 
    // Ajoute un espacement de 10 pixels sous le bouton pour éviter qu'il ne touche d'autres éléments.
  },

  // Style pour les boutons actifs
  buttonActive: {
    backgroundColor: '#007bff', 
    // Applique une couleur de fond bleue (bleu primaire) pour les boutons actifs,
    // rendant ces boutons visuellement engageants et interactifs.
  },

  // Style pour les boutons désactivés
  buttonDisabled: {
    backgroundColor: '#ccc', 
    // Utilise une couleur grise claire pour les boutons désactivés,
    // signalant à l'utilisateur qu'ils ne sont pas interactifs.
  },

  // Conteneur pour les boutons de difficulté
  difficultyButtons: {
    flexDirection: 'row', 
    // Dispose les boutons horizontalement les uns à côté des autres.

    marginTop: 20, 
    // Ajoute un espace de 20 pixels au-dessus du conteneur pour le séparer des autres éléments.
  },

  // Style générique pour les boutons de difficulté
  difficultyButton: {
    padding: 10, 
    // Ajoute un espace interne de 10 pixels pour rendre les boutons de difficulté cliquables.

    borderRadius: 5, 
    // Arrondit les coins pour un style moderne.

    marginHorizontal: 10, 
    // Ajoute un espacement horizontal entre chaque bouton, 
    // évitant qu'ils soient trop rapprochés.
  },

  // Style pour l'état actif du bouton "Facile"
  easyActive: {
    width: 50, 
    // Définit une largeur fixe de 50 pixels pour le bouton.

    height: 50, 
    // Définit une hauteur fixe de 50 pixels pour donner une apparence carrée.
  },

  // Style pour l'état inactif du bouton "Facile"
  easyInactive: {
    width: 50, 
    height: 50, 
    opacity: 0.5, 
    // Réduit l'opacité à 50 % pour signaler que le bouton est inactif.
  },

  // Style pour l'état actif du bouton "Difficile"
  hardActive: {
    width: 50, 
    height: 50, 
  },

  // Style pour l'état inactif du bouton "Difficile"
  hardInactive: {
    width: 50, 
    height: 50, 
    opacity: 0.5, 
  },

  // Style pour le texte des boutons de difficulté
  difficultyText: {
    color: '#fff', 
    // Utilise une couleur blanche pour contraster avec le fond coloré des boutons.

    fontSize: 16, 
    // Définit une taille de police modérée pour rester lisible.

    textAlign: 'center', 
    // Centre le texte à l'intérieur du bouton.
  },

  // Style pour les messages dynamiques
  message: {
    fontSize: 18, 
    color: '#333', 
    marginTop: 20, 
    textAlign: 'center', 
    // Style simple et centré pour les messages affichés (feedback, avertissements).
  },

  // Style pour l'affichage des vies restantes
  lives: {
    fontSize: 18, 
    color: '#333', 
    marginTop: 20, 
    textAlign: 'center', 
  },

  // Style pour l'affichage du score
  score: {
    fontSize: 18, 
    color: '#333', 
    marginTop: 20, 
    textAlign: 'center', 
  },

  // Conteneur pour le menu de fin de jeu
  gameOverMenu: {
    marginTop: 20, 
    // Ajoute un espace de 20 pixels au-dessus du menu pour le séparer des autres éléments.

    alignItems: 'center', 
    // Centre horizontalement tous les éléments enfants du menu.
  },

  // Style pour le texte affiché dans le menu de fin de jeu
  gameOverText: {
    fontSize: 20, 
    color: '#333', 
    marginBottom: 10, 
    // Texte plus grand et espacé pour signaler clairement la fin de la partie.
  },

  // Style générique pour les boutons du menu de fin de jeu
  gameOverButton: {
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 5, 
    marginBottom: 10, 
    // Boutons bien espacés avec des coins arrondis et un padding généreux.
  },

  // Style pour les images des boutons du menu de fin de jeu
  gameOverButtonImage: {
    width: 50, 
    height: 50, 
    // Icônes de taille fixe pour maintenir une apparence cohérente.
  },
});
