// Importation des composants nécessaires de React Native et des hooks de React
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { useState, useEffect, useRef } from 'react';

// Définition des constantes pour les paramètres du jeu (les noms de variables des constantes doivent être entièrement en majuscule)
const MAX_NUMBER = 50; //Constante contenant la valeur 50 comme nombre maximum tiré au sort pour numberOne, numberTwo et numberTree
const EASY_TIME = 10; // Constante pour le mode facile, 10 secondes pour facile
const HARD_TIME = 5; // Constante pour le mode difficile, 5 secondes pour difficile
const MAX_LIVES = 3; // Constante pour le nombre maximum de vies ( 3 dans ce jeu !)
const EASY_POINTS = 5; // Constante pour le nombre de points attribué en facile, 5 points !
const HARD_POINTS = 10; // Constante pour le nom

// Fonction pour générer un nombre entier aléatoire entre 0 et max - 1 , donc entre 0 et 49
const rndNumber = (max) => Math.floor(Math.random() * max);

// Fonction pour formater le temps en mm:ss
const formatTime = (time) => (time < 10 ? `00 : 0${time}` : `00 : ${time}`);

// Composant principal de l'application
export default function App() { // Le composant est accessible ailleurs avec "export default"  et "App()" est la fonction principale qui représente l'application l'application
  // Initialisation des états avec useState
  const [numberOne, setNumberOne] = useState(rndNumber(MAX_NUMBER)); // useState est un Hook qui permet d'ajouter l'état local à un composant fonction, ici un état numberOne et l'initialise avec une valeur aléatoire obtenue par rndNumber(MAX_NUMBER).
  const [numberTwo, setNumberTwo] = useState(rndNumber(MAX_NUMBER)); // Même fonction que pour numberOne, mais pour une deuxième valeur numberTwo aléatoire
  const [numberThree, setNumberThree] = useState(null); // Initialise numberThree à null, car il n'est utilisé qu'en mode difficile
  const [solution, setSolution] = useState(0); // Stocke la bonne réponse du calcul en cours. Il est initialisé à 0 mais mis à jour dès que numberOne, numberTwo , numberThree difficulty ou operation changent
  const [userAnswer, setUserAnswer] = useState('');// userAnswer stocke la réponse entrée par l'utilisateur. Il est initialisé à une chaîne vide car l'utilisateur n'a rien tapé au départ
  const [msg, setMsg] = useState('');  // Permet avec msg qui est une chaîne de texte d'afficher des messages (Félicitation, Explication si réponse fausse, Indications de fin du jeu..)
  const [operation, setOperation] = useState('addition'); // Opération stocke le type d'opération à effectuer (addition, soustraction, multiplication, division). Il est initialisé avec 'addition', donc par défaut, le jeu commence avec des additions.

  const [timeLeft, setTimeLeft] = useState(EASY_TIME); // Gère le temps restant avant la fin de la question . // Initialisé avec EASY_TIME (10 secondes pour le mode facile)
  const [btnEnabled, setBtnEnabled] = useState(true); //contrôle l'activation/désactivation du bouton "Soumettre" . true = bouton actif, false = bouton désactivé (ex: après Game Over)
  const [lives, setLives] = useState(MAX_LIVES); // Gère le nombre de vies restantes. Initialisé avec MAX_LIVES (3 vies)
  const [score, setScore] = useState(0); // Stocke le score du joueur, commence à 0 et s'incrémente.  Augmente selon la difficulté : EASY_POINTS (5 points) ou HARD_POINTS (10 points)

  const [difficulty, setDifficulty] = useState('easy'); // Concerne la difficulté actuelle du jeu.  Par défaut, il est en "easy" (facile), l'utilisateur peut passer en "hard"
  const [gameOver, setGameOver] = useState(false); // Indique si le jeu est terminé ou non . false = le jeu continue, true = l'utilisateur a perdu toutes ses vies
  const [canChangeDifficulty, setCanChangeDifficulty] = useState(true); // Permet ou interdit le changement de difficulté , true = l'utilisateur peut changer la difficulté, false = il ne peut plus la modifier
  // Il passe à false après la première réponse pour éviter la triche

  const timerRef = useRef(null);  // Référence pour stocker l'identifiant du compte à rebours

  // useEffect pour mettre à jour la solution en fonction de la difficulté, des nombres, et de l'opération
  useEffect(() => {
    let result;
    if (difficulty === 'hard') { // Si la difficulté est "difficile"
      if (operation === 'addition') { // Si l'opération  est addition, "=== :  même valeur et même type"
        result = numberOne + numberTwo + (numberThree || 0); // Le résultat vaut l'addition de numberOne, numberTwo et de numberThree (ou zéro)
      } else if (operation === 'subtraction') { // Si l'opération est soustraction, "=== : même valeur et même type"
        result = numberOne - numberTwo - (numberThree || 0); // Le résultat vaut la soustraction de numberOne, numberTwo et de numberThree (ou zéro)
      } else if (operation === 'multiplication') {   // Si l'opération est multiplication
        result = numberOne * numberTwo * (numberThree || 1); // Le résultat correspond ici à la multiplication de numberOne, numberTwo et de numberThree (ou 1, 1 car 0 annule la multiplication)
      } else if (operation === 'division') {
        result = (numberThree !== 0) ? numberOne / numberTwo / numberThree : 1;
      }
    } else { // Sinon en "facile" 
      if (operation === 'addition') { // Si l'opération est addition, "=== : même valeur et même type"        "
        result = numberOne + numberTwo; // Résultat "result" qui correspond au résultat de l'addition de numberOne et numberTwo
      } else if (operation === 'subtraction') {  // Sinon si l'opération est subtraction, "=== : même valeur et même type"
        result = numberOne - numberTwo;  // Résultat "result" qui correspond au résultat de la soustraction de numberOne et numberTwo
      } else if (operation === 'multiplication') { // Sinon si l'opération est multiplication, "=== : même valeur et même type"
        result = numberOne * numberTwo; // Résultat "result" qui correspond au résultat de la multiplication de numberOne et numberTwo
      } else if (operation === 'division') { // Sinon si l'opération est division, "=== : même valeur et même type"
        result = (numberTwo !== 0) ? numberOne / numberTwo : 1; // Résultat "result" qui correspond au résultat de la division de numberOne par numberTwo
      }
    }
    setSolution(result); // Met à jour l’état solution avec la nouvelle valeur result (le résultat du calcul mathématique).
  }, [numberOne, numberTwo, numberThree, difficulty, operation]);// Si numberOne, numberTwo, numberThree, difficulty ou operation change, alors le code se ré-exécute et recalcule la solution.

  // useEffect pour gérer le timeout et la perte de vie
  useEffect(() => {
    if (timeLeft === 0) { // Si le temps restant est égal à 0
      handleTimeOut(); // Gérer la perte de vie quand le temps est écoulé
    }
  }, [timeLeft]); // Ce useEffect sera appelé chaque fois que timeLeft change

  // Fonction pour démarrer le timer
  const startTimer = () => {
    clearInterval(timerRef.current);   // Arrête tout timer en cours pour éviter les doublons
    timerRef.current = setInterval(() => {    // Démarre un nouvel intervalle qui décrémente le temps chaque seconde
      setTimeLeft((prev) => Math.max(prev - 1, 0));  // Réduit `timeLeft` de 1, mais empêche qu'il passe sous 0
    }, 1000); // Exécution toutes les 1000 ms (1 seconde)
  };

  // Fonction pour gérer le timeout
const handleTimeOut = () => {
  
  setLives((prevLives) => { // Met à jour le nombre de vies restantes
    const newLives = Math.max(prevLives - 1, 0);    // Diminue le nombre de vies, mais empêche qu'il devienne négatif
    if (newLives === 0) {  // Si l'utilisateur n'a plus de vies, active le mode Game Over
      setMsg(`Game Over! La réponse était ${solution}`);
      setBtnEnabled(false); // Désactive le bouton "Soumettre"
      setGameOver(true); // Déclenche l'affichage du Game Over
      setTimeLeft(0); // Réinitialise le timer à zéro
    } 
    
    // Sinon, informe l'utilisateur et passe à la question suivante
    else {
      setMsg(`Temps écoulé, la bonne réponse était ${solution}. Il vous reste ${newLives} vies.`);   // Affiche un message indiquant que le temps est écoulé et donne la bonne réponse
      
   
      setTimeout(() => {  // Déclenche un délai avant l'exécution
        handleNextQuestion();  // Passe à la question suivante
      }, 2000);  // Attend 2 secondes avant d'exécuter la fonction
    }      
    return newLives; // Met à jour l'état des vies
  });
};


 // Fonction pour démarrer une nouvelle partie
const handleNewGame = () => {
  setNumberOne(rndNumber(MAX_NUMBER));   // Génère un premier nombre aléatoire
  setNumberTwo(rndNumber(MAX_NUMBER));   // Génère un deuxième nombre aléatoire
  if (difficulty === 'hard') setNumberThree(rndNumber(MAX_NUMBER));   // Si la difficulté est "hard", génère un troisième nombre aléatoire
  setUserAnswer(''); // Réinitialise la réponse de l'utilisateur
  setMsg('');  // Réinitialise le message affiché
  setTimeLeft(difficulty === 'hard' ? HARD_TIME : EASY_TIME);   // Définit le temps en fonction de la difficulté (10s facile, 5s difficile)
  setBtnEnabled(true);  // Active le bouton "Soumettre"
  setLives(MAX_LIVES);  // Réinitialise le nombre de vies à la valeur maximale
  setScore(0); // Remet le score à 0
  setGameOver(false);   // Désactive l'état Game Over
  setCanChangeDifficulty(true);    // Permet à l'utilisateur de modifier la difficulté à nouveau
  startTimer();    // Démarre le compte à rebours
};

// Fonction pour passer à la question suivante
const handleNextQuestion = () => {
  setNumberOne(rndNumber(MAX_NUMBER));  // Génère un nouveau premier nombre aléatoire
  setNumberTwo(rndNumber(MAX_NUMBER));  // Génère un nouveau deuxième nombre aléatoire
  if (difficulty === 'hard') setNumberThree(rndNumber(MAX_NUMBER));  // Si en mode difficile, génère un troisième nombre
  setUserAnswer('');  // Réinitialise la réponse utilisateur
  setMsg('');  // Efface le message précédent
  setTimeLeft(difficulty === 'hard' ? HARD_TIME : EASY_TIME);  // Réinitialise le temps selon la difficulté
  setBtnEnabled(true);  // Active le bouton "Soumettre"
  setCanChangeDifficulty(true);  // Réautorise le changement de difficulté
  startTimer();  // Relance le timer pour la nouvelle question
};

// Fonction pour soumettre la réponse de l'utilisateur
const handleSubmit = () => {
  setCanChangeDifficulty(false);  // Bloque le changement de difficulté après la réponse
  if (parseInt(userAnswer) === solution) {  // Vérifie si la réponse est correcte
    clearInterval(timerRef.current);  // Arrête le timer actuel
    setMsg(`Bravo continue c'était bien le nombre ${solution}`);  // Affiche un message de succès
    setScore((prevScore) => prevScore + (difficulty === 'hard' ? HARD_POINTS : EASY_POINTS));  // Ajoute des points selon la difficulté
    setTimeout(() => {  // Attend 2 secondes avant de passer à la prochaine question
      handleNextQuestion();
    }, 2000);
  } else {  // Si la réponse est incorrecte
    setLives((prevLives) => {  // Met à jour le nombre de vies restantes
      const newLives = Math.max(prevLives - 1, 0);  // Réduit les vies mais empêche d'aller sous 0
      if (newLives === 0) {  // Si l'utilisateur n'a plus de vies
        setMsg(`Game Over! La réponse était ${solution}`);  // Affiche un message Game Over avec la bonne réponse
        setBtnEnabled(false);  // Désactive le bouton "Soumettre"
        setGameOver(true);  // Active l'état Game Over
        setTimeLeft(0);  // Met le timer à zéro
      } else {  // Si l'utilisateur a encore des vies
        setMsg(`Mauvaise réponse, la réponse était ${solution}. Il vous reste ${newLives} vies.`);  // Indique l'erreur et le nombre de vies restantes
        setTimeout(() => {  // Attend 2 secondes avant la prochaine question
          handleNextQuestion();
        }, 2000);
      }
      return newLives;  // Met à jour l'état des vies
    });
  }
};

// Fonction pour changer la difficulté
const handleDifficultyChange = (level) => {
  if (canChangeDifficulty) {  // Vérifie si le changement de difficulté est autorisé
    setDifficulty(level);  // Met à jour le niveau de difficulté
    setTimeLeft(level === 'hard' ? HARD_TIME : EASY_TIME);  // Ajuste le temps en fonction du mode
    if (level === 'hard') {  // Si on passe en mode difficile
      setNumberThree(rndNumber(MAX_NUMBER));  // Génère un troisième nombre aléatoire
    } else {
      setNumberThree(null);  // Réinitialise numberThree en mode facile
    }
    handleNextQuestion();  // Génère une nouvelle question après le changement de difficulté
  }
};

// Fonction pour changer l'opération en cours
const handleOperationChange = (op) => {
  setOperation(op);  // Met à jour l'opération choisie (+, -, ×, ÷)
  handleNextQuestion();  // Passe immédiatement à la question suivante
};

const randomizeExtremeMixedOperation = () => {
  const operations = ['+', '-', '×', '÷'];  // Liste des opérateurs possibles

  const op1 = operations[Math.floor(Math.random() * operations.length)];  // Sélection du premier opérateur aléatoire
  const op2 = operations[Math.floor(Math.random() * operations.length)];  // Sélection du deuxième opérateur aléatoire

  let num1 = rndNumber(MAX_NUMBER);  // Génère le premier nombre aléatoire
  let num2 = rndNumber(MAX_NUMBER);  // Génère le deuxième nombre aléatoire
  let num3 = rndNumber(MAX_NUMBER);  // Génère le troisième nombre aléatoire

  let result;  // Variable pour stocker le résultat final

  // Vérification pour éviter la division par zéro
  if (op1 === '÷' && num2 === 0) num2 = 1;  
  if (op2 === '÷' && num3 === 0) num3 = 1;  

  // Effectue le calcul en respectant les priorités des opérateurs
  switch (op1) {
    case '+':
      result = op2 === '+' ? num1 + num2 + num3 :
               op2 === '-' ? num1 + num2 - num3 :
               op2 === '×' ? num1 + (num2 * num3) :
               num1 + (num2 / num3);
      break;
    case '-':
      result = op2 === '+' ? num1 - num2 + num3 :
               op2 === '-' ? num1 - num2 - num3 :
               op2 === '×' ? num1 - (num2 * num3) :
               num1 - (num2 / num3);
      break;
    case '×':
      result = op2 === '+' ? (num1 * num2) + num3 :
               op2 === '-' ? (num1 * num2) - num3 :
               op2 === '×' ? num1 * num2 * num3 :
               (num1 * num2) / num3;
      break;
    case '÷':
      result = op2 === '+' ? (num1 / num2) + num3 :
               op2 === '-' ? (num1 / num2) - num3 :
               op2 === '×' ? (num1 / num2) * num3 :
               (num1 / num2) / num3;
      break;
  }

  setOperation(`${op1} ${op2}`);  // Stocke les opérateurs choisis
  setNumberOne(num1);  // Stocke le premier nombre
  setNumberTwo(num2);  // Stocke le deuxième nombre
  setNumberThree(num3);  // Stocke le troisième nombre
  setSolution(result);  // Stocke la solution calculée
  handleNextQuestion();  // Passe à la prochaine question
};



// Fonction pour choisir une opération aléatoire parmi les 4 de base
const randomizeOperation = () => {
  const operations = ['addition', 'subtraction', 'multiplication', 'division'];  // Liste des opérations possibles
  const randomOp = operations[Math.floor(Math.random() * operations.length)];  // Sélectionne une opération au hasard
  setOperation(randomOp);  // Applique l'opération aléatoire
  handleNextQuestion();  // Génère une nouvelle question immédiatement
};

return (
  <View style={styles.container}> 

    <Text style={styles.timer}>  
      {gameOver ? '00 : 00' : formatTime(timeLeft)}  
    </Text>

    {!gameOver && (  // Affiche la question uniquement si le jeu n'est pas terminé
      <Text style={styles.question}>
        {numberOne}  
        {operation === 'addition' && ' + '}  
        {operation === 'subtraction' && ' - '}  
        {operation === 'multiplication' && ' × '} 
        {operation === 'division' && ' ÷ '} 
        {numberTwo} 
        {difficulty === 'hard' && numberThree !== null  // Si mode difficile et troisième nombre existe
          ? ` ${operation === 'addition' ? '+' : operation === 'subtraction' ? '-' : operation === 'multiplication' ? '×' : '÷'} ${numberThree}`  // Ajoute le troisième nombre avec son opérateur
          : ''} =
      </Text>
    )}

    <TextInput  // Zone de saisie de la réponse de l'utilisateur
      style={styles.input}  // Applique les styles définis
      placeholder="Entrez votre réponse"  // Affiche un texte par défaut avant saisie
      keyboardType="numeric"  // Force un clavier numérique pour éviter les erreurs
      onChangeText={setUserAnswer}  // Met à jour la réponse de l'utilisateur
      value={userAnswer}  // Garde la valeur tapée par l'utilisateur
      editable={!gameOver}  // Désactive la saisie si le jeu est terminé
    />

    <TouchableOpacity  // Bouton pour soumettre la réponse
      style={[styles.button, btnEnabled ? styles.buttonActive : styles.buttonDisabled]}  // Change le style si le bouton est actif ou non
      onPress={handleSubmit}  // Exécute la fonction handleSubmit() lors du clic
      disabled={!btnEnabled || gameOver}  // Désactive le bouton si le jeu est terminé
    >
      <Text style={styles.buttonText}>Soumettre</Text>  
    </TouchableOpacity>

    <View style={styles.difficultyButtons}>  

      <TouchableOpacity  // Bouton pour passer en mode "easy"
        style={styles.difficultyButton}  
        onPress={() => handleDifficultyChange('easy')}  // Exécute handleDifficultyChange('easy') au clic
        disabled={!canChangeDifficulty || gameOver}  // Désactive le bouton si on ne peut pas changer la difficulté
      >
        <Image
          source={require('./assets/easy.png')}  // Affiche l'image pour le mode "easy"
          style={difficulty === 'easy' ? styles.easyActive : styles.easyInactive}  // Change l'apparence si "easy" est actif
        />
      </TouchableOpacity>

      <TouchableOpacity  // Bouton pour passer en mode "hard"
        style={styles.difficultyButton}  
        onPress={() => handleDifficultyChange('hard')}  // Exécute handleDifficultyChange('hard') au clic
        disabled={!canChangeDifficulty || gameOver}  // Désactive si on ne peut pas changer la difficulté
      >
        <Image
          source={require('./assets/hard.png')}  // Affiche l'image pour le mode "hard"
          style={difficulty === 'hard' ? styles.hardActive : styles.hardInactive}  // Change l'apparence si "hard" est actif
        />
      </TouchableOpacity>

    </View>

    <View style={styles.operationButtons}> 
      <TouchableOpacity onPress={() => handleOperationChange('addition')}>  
        <Text style={styles.operationButton}>+</Text> 
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleOperationChange('subtraction')}>  
        <Text style={styles.operationButton}>-</Text> 
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleOperationChange('multiplication')}>  
        <Text style={styles.operationButton}>×</Text> 
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleOperationChange('division')}>  
        <Text style={styles.operationButton}>÷</Text> 
      </TouchableOpacity>
    </View>

    <TouchableOpacity style={styles.randomOperationButton} onPress={randomizeOperation}>  
      <Text style={styles.randomButtonText}>Opération Aléatoire</Text>
    </TouchableOpacity>

    <TouchableOpacity  // Bouton pour activer le "Mode Mélange Extrême"
      style={styles.randomExtremeOperationButton}
      onPress={randomizeExtremeMixedOperation}  // Exécute la fonction pour activer le mode Mélange Extrême
      disabled={difficulty !== 'hard'}  // Désactive si la difficulté n'est pas "hard"
    >
      <Text style={styles.randomButtonText}>Mode Mélange Extrême (Hard)</Text>
    </TouchableOpacity>

    <Text style={styles.message}>{msg}</Text>  
    <Text style={styles.lives}>Vies restantes: {lives}</Text>  
    <Text style={styles.score}>Score: {score}</Text>  
    {gameOver && (  // Vérifie si le jeu est terminé avant d'afficher le menu de fin
      <View style={styles.gameOverMenu}>  
        <Text style={styles.gameOverText}>Commencer une nouvelle partie ?</Text> 
        
        <TouchableOpacity style={styles.gameOverButton} onPress={handleNewGame}> 
          <Image source={require('./assets/yes.png')} style={styles.gameOverButtonImage} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.gameOverButton} onPress={() => window.location.href = "https://www.google.com"}>  
          <Image source={require('./assets/no.png')} style={styles.gameOverButtonImage} />
        </TouchableOpacity>
      </View>
    )}

  </View>  // Fin du conteneur principal
);

}
const styles = StyleSheet.create({  // Définition des styles pour les composants React Native

  container: {  // Style du conteneur principal de l'application
    flex: 1,  // Permet au conteneur de prendre toute la hauteur de l'écran
    backgroundColor: '#f4f4f4',  // Définit la couleur de fond en gris clair
    alignItems: 'center',  // Centre les éléments horizontalement
    justifyContent: 'center',  // Centre les éléments verticalement
    padding: 20,  // Ajoute une marge intérieure de 20 pixels autour du contenu
  },

  timer: {  // Style du chronomètre
    fontSize: 40,  // Taille du texte en grand pour bien voir le temps restant
    fontWeight: 'bold',  // Met le texte en gras pour plus de visibilité
    color: '#333',  // Couleur du texte en gris foncé
    marginBottom: 20,  // Ajoute un espace de 20 pixels en dessous
  },

  randomOperationButton: {  // Style du bouton "Opération Aléatoire"
    marginTop: 20,  // Ajoute un espace de 20 pixels au-dessus
    backgroundColor: '#28a745',  // Définit une couleur verte pour le bouton
    paddingVertical: 10,  // Ajoute un padding vertical de 10 pixels
    paddingHorizontal: 30,  // Ajoute un padding horizontal de 30 pixels
    borderRadius: 5,  // Arrondit légèrement les coins du bouton
  },

  randomExtremeOperationButton: {  // Style du bouton "Mode Mélange Extrême"
    marginTop: 20,  // Ajoute un espace de 20 pixels au-dessus
    backgroundColor: '#ff9800',  // Couleur orange spécifique pour ce bouton
    paddingVertical: 10,  // Ajoute un padding vertical de 10 pixels
    paddingHorizontal: 30,  // Ajoute un padding horizontal de 30 pixels
    borderRadius: 5,  // Arrondit légèrement les coins du bouton
  },

  randomButtonText: {  // Style du texte à l'intérieur des boutons aléatoires
    fontSize: 18,  // Définit une taille de texte lisible
    color: '#fff',  // Met le texte en blanc pour contraster avec le fond coloré
  },

  question: {  // Style de la question mathématique
    fontSize: 24,  // Définit une grande taille pour bien voir l'équation
    fontWeight: 'bold',  // Met le texte en gras pour plus de clarté
    marginBottom: 20,  // Ajoute un espace de 20 pixels sous la question
    color: '#555',  // Utilise une couleur de texte gris foncé
  },

  input: {  // Style du champ de saisie de l'utilisateur
    borderWidth: 1,  // Ajoute une bordure fine autour du champ
    borderColor: '#ccc',  // Couleur de la bordure en gris clair
    borderRadius: 5,  // Arrondit légèrement les coins du champ de saisie
    padding: 10,  // Ajoute un padding intérieur de 10 pixels
    fontSize: 18,  // Définit une taille de texte lisible
    width: '80%',  // Définit la largeur du champ à 80% de l'écran
    marginBottom: 20,  // Ajoute un espace de 20 pixels sous le champ
    backgroundColor: '#fff',  // Fond blanc pour bien voir la saisie
  },

  button: {  // Style général des boutons
    paddingVertical: 15,  // Ajoute un padding vertical de 15 pixels
    paddingHorizontal: 30,  // Ajoute un padding horizontal de 30 pixels
    borderRadius: 5,  // Arrondit légèrement les coins du bouton
    marginBottom: 10,  // Ajoute un espace de 10 pixels sous le bouton
  },

  buttonActive: {  // Style du bouton lorsqu'il est actif
    backgroundColor: '#007bff',  // Définit une couleur bleue pour le bouton actif
  },

  buttonDisabled: {  // Style du bouton lorsqu'il est désactivé
    backgroundColor: '#ccc',  // Utilise une couleur grise pour signaler un bouton inactif
  },

  message: {  // Style du message affiché (ex : bonne/mauvaise réponse)
    fontSize: 18,  // Définit une taille de texte lisible
    color: '#333',  // Couleur du texte en gris foncé
    marginTop: 20,  // Ajoute un espace de 20 pixels au-dessus
    textAlign: 'center',  // Centre le texte horizontalement
  },

  lives: {  // Style pour afficher le nombre de vies restantes
    fontSize: 18,  
    color: '#333',  
    marginTop: 20,  
    textAlign: 'center',  
  },

  score: {  // Style pour afficher le score du joueur
    fontSize: 18,  
    color: '#333',  
    marginTop: 20,  
    textAlign: 'center',  
  },

  gameOverMenu: {  // Style du menu affiché en cas de Game Over
    marginTop: 20,  // Ajoute un espace de 20 pixels au-dessus
    alignItems: 'center',  // Centre les éléments horizontalement
  },

  gameOverButton: {  // Style des boutons du menu Game Over
    paddingVertical: 10,  // Ajoute un padding vertical de 10 pixels
    paddingHorizontal: 20,  // Ajoute un padding horizontal de 20 pixels
    borderRadius: 5,  // Arrondit légèrement les coins du bouton
    marginBottom: 10,  // Ajoute un espace de 10 pixels sous chaque bouton
  },

  gameOverButtonImage: {  // Style des images des boutons "Oui" et "Non" dans le menu Game Over
    width: 50,  // Définit une largeur de 50 pixels
    height: 50,  // Définit une hauteur de 50 pixels
  },

  difficultyButtons: {  // Style du conteneur des boutons de difficulté
    flexDirection: 'row',  // Aligne les boutons en ligne
    marginTop: 20,  // Ajoute un espace de 20 pixels au-dessus
  },

  difficultyButton: {  // Style général des boutons de difficulté
    padding: 10,  // Ajoute un padding intérieur de 10 pixels
    borderRadius: 5,  // Arrondit légèrement les coins du bouton
    marginHorizontal: 10,  // Ajoute un espace horizontal entre les boutons
  },

  easyActive: {  // Style de l'icône "easy" lorsque ce mode est actif
    width: 60,  // Définit une largeur de 60 pixels
    height: 60,  // Définit une hauteur de 60 pixels
  },

  easyInactive: {  // Style de l'icône "easy" lorsque ce mode n'est pas actif
    width: 60,  
    height: 60,  
    opacity: 0.5,  // Réduit l'opacité pour indiquer qu'il n'est pas sélectionné
  },

  hardActive: {  // Style de l'icône "hard" lorsque ce mode est actif
    width: 60,  
    height: 60,  
  },

  hardInactive: {  // Style de l'icône "hard" lorsque ce mode n'est pas actif
    width: 60,  
    height: 60,  
    opacity: 0.5,  // Réduit l'opacité pour indiquer qu'il n'est pas sélectionné
  },

  operationButtons: {  // Style du conteneur des boutons d'opérations mathématiques
    flexDirection: 'row',  // Aligne les boutons horizontalement
    marginTop: 20,  // Ajoute un espace de 20 pixels au-dessus
  },

  operationButton: {  // Style des boutons pour choisir une opération (+, -, ×, ÷)
    fontSize: 30,  // Définit une grande taille pour une meilleure visibilité
    padding: 20,  // Ajoute un padding intérieur de 20 pixels
    marginHorizontal: 10,  // Ajoute un espace horizontal entre les boutons
    backgroundColor: '#007bff',  // Applique une couleur bleue aux boutons
    color: '#fff',  // Met le texte en blanc pour un bon contraste
    borderRadius: 5,  // Arrondit légèrement les coins du bouton
  },

}); 



