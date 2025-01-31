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
  const [operation, setOperation] = useState('addition'); // Opération choisie par défaut

  const [timeLeft, setTimeLeft] = useState(EASY_TIME);
  const [btnEnabled, setBtnEnabled] = useState(true);
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);

  const [difficulty, setDifficulty] = useState('easy');
  const [gameOver, setGameOver] = useState(false);
  const [canChangeDifficulty, setCanChangeDifficulty] = useState(true);

  const timerRef = useRef(null);

  // useEffect pour mettre à jour la solution en fonction de la difficulté, des nombres, et de l'opération
  useEffect(() => {
    let result;
    if (difficulty === 'hard') { // Si la difficulté est "difficile"
      if (operation === 'addition') { // Si l'opération  est addition, "=== :  même valeur et même type"
        result = numberOne + numberTwo + (numberThree || 0); // Le résultat vaut l'addition de numberOne, numberTwo et de numberThree (ou zéro)
      } else if (operation === 'subtraction') { // Si l'opération est soustraction, "=== : même valeur et même type"
        result = numberOne - numberTwo - (numberThree || 0); // Le résultat vaut la soustraction de numberOne, numberTwo et de numberThree (ou zéro)
      } else if (operation === 'multiplication') {   // 
        result = numberOne * numberTwo * (numberThree || 1);
      } else if (operation === 'division') {
        result = (numberThree !== 0) ? numberOne / numberTwo / numberThree : 1;
      }
    } else {
      if (operation === 'addition') {
        result = numberOne + numberTwo;
      } else if (operation === 'subtraction') {
        result = numberOne - numberTwo;
      } else if (operation === 'multiplication') {
        result = numberOne * numberTwo;
      } else if (operation === 'division') {
        result = (numberTwo !== 0) ? numberOne / numberTwo : 1;
      }
    }
    setSolution(result);
  }, [numberOne, numberTwo, numberThree, difficulty, operation]);

  // useEffect pour gérer le timeout et la perte de vie
  useEffect(() => {
    if (timeLeft === 0) {
      handleTimeOut(); // Gérer la perte de vie quand le temps est écoulé
    }
  }, [timeLeft]); // Ce useEffect sera appelé chaque fois que timeLeft change

  // Fonction pour démarrer le timer
  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
  };

  // Fonction pour gérer le timeout
  const handleTimeOut = () => {
    setLives((prevLives) => {
      const newLives = Math.max(prevLives - 1, 0);
      if (newLives === 0) {
        setMsg(`Game Over! La réponse était ${solution}`);
        setBtnEnabled(false);
        setGameOver(true);
        setTimeLeft(0);  // Mettre le compteur à zéro
      } else {
        setMsg(`Temps écoulé, la bonne réponse était ${solution}. Il vous reste ${newLives} vies.`);
        setTimeout(() => {
          handleNextQuestion();
        }, 2000);
      }
      return newLives;
    });
  };

  // Fonction pour démarrer une nouvelle partie
  const handleNewGame = () => {
    setNumberOne(rndNumber(MAX_NUMBER));
    setNumberTwo(rndNumber(MAX_NUMBER));
    if (difficulty === 'hard') setNumberThree(rndNumber(MAX_NUMBER));
    setUserAnswer('');
    setMsg('');
    setTimeLeft(difficulty === 'hard' ? HARD_TIME : EASY_TIME);
    setBtnEnabled(true);
    setLives(MAX_LIVES);
    setScore(0);
    setGameOver(false);
    setCanChangeDifficulty(true);
    startTimer();
  };

  // Fonction pour passer à la question suivante
  const handleNextQuestion = () => {
    setNumberOne(rndNumber(MAX_NUMBER));
    setNumberTwo(rndNumber(MAX_NUMBER));
    if (difficulty === 'hard') setNumberThree(rndNumber(MAX_NUMBER));
    setUserAnswer('');
    setMsg('');
    setTimeLeft(difficulty === 'hard' ? HARD_TIME : EASY_TIME);
    setBtnEnabled(true);
    setCanChangeDifficulty(true);
    startTimer();
  };

  // Fonction pour soumettre la réponse de l'utilisateur
  const handleSubmit = () => {
    setCanChangeDifficulty(false);
    if (parseInt(userAnswer) === solution) {
      clearInterval(timerRef.current);
      setMsg(`Bravo continue c'était bien le nombre ${solution}`);
      setScore((prevScore) => prevScore + (difficulty === 'hard' ? HARD_POINTS : EASY_POINTS));
      setTimeout(() => {
        handleNextQuestion();
      }, 2000);
    } else {
      setLives((prevLives) => {
        const newLives = Math.max(prevLives - 1, 0);
        if (newLives === 0) {
          setMsg(`Game Over! La réponse était ${solution}`);
          setBtnEnabled(false);
          setGameOver(true);
          setTimeLeft(0);  // Mettre le compteur à zéro
        } else {
          setMsg(`Mauvaise réponse, la réponse était ${solution}. Il vous reste ${newLives} vies.`);
          setTimeout(() => {
            handleNextQuestion();
          }, 2000);
        }
        return newLives;
      });
    }
  };

  // Fonction pour changer la difficulté
  const handleDifficultyChange = (level) => {
    if (canChangeDifficulty) {
      setDifficulty(level);
      setTimeLeft(level === 'hard' ? HARD_TIME : EASY_TIME);
      if (level === 'hard') {
        setNumberThree(rndNumber(MAX_NUMBER));
      } else {
        setNumberThree(null);
      }
      handleNextQuestion();
    }
  };

  // Fonction pour changer l'opération
  const handleOperationChange = (op) => {
    setOperation(op);
    handleNextQuestion();
  };

  // Fonction pour randomiser l'opération en mode "hard" avec un mélange d'opérations
  const randomizeExtremeMixedOperation = () => {
    const operations = [
      { op: 'addition_subtraction', calc: (a, b, c) => a + b - c },  // a + b - c
      { op: 'addition_multiplication', calc: (a, b, c) => a + b * c },  // a + b * c
      { op: 'subtraction_multiplication', calc: (a, b, c) => a - b * c },  // a - b * c
      { op: 'multiplication_addition', calc: (a, b, c) => a * b + c },  // a * b + c
      { op: 'multiplication_subtraction', calc: (a, b, c) => a * b - c },  // a * b - c
      { op: 'addition_multiplication_subtraction', calc: (a, b, c) => a + b * c - a }, // a + b * c - a
      { op: 'multiplication_addition_subtraction', calc: (a, b, c) => a * b + c - a }, // a * b + c - a
    ];

    const randomOp = operations[Math.floor(Math.random() * operations.length)];
    setOperation(randomOp.op);
    setSolution(randomOp.calc(numberOne, numberTwo, numberThree || 1));
    handleNextQuestion();
  };

  // Fonction pour randomiser l'opération de manière aléatoire
  const randomizeOperation = () => {
    const operations = ['addition', 'subtraction', 'multiplication', 'division'];
    const randomOp = operations[Math.floor(Math.random() * operations.length)];
    setOperation(randomOp);
    handleNextQuestion();
  };

  return (
    <View style={styles.container}>
      {/* Chronomètre */}
      <Text style={styles.timer}>{gameOver ? '00 : 00' : formatTime(timeLeft)}</Text>

      {/* Question mathématique */}
      {!gameOver && (
        <Text style={styles.question}>
          {numberOne} {operation === 'addition' && ' + '}
          {operation === 'subtraction' && ' - '}
          {operation === 'multiplication' && ' × '}
          {operation === 'division' && ' ÷ '}
          {numberTwo}
          {difficulty === 'hard' && numberThree !== null ? ` ${operation === 'addition' ? '+' : operation === 'subtraction' ? '-' : operation === 'multiplication' ? '×' : '÷'} ${numberThree}` : ''} =
        </Text>
      )}

      {/* Champ de saisie pour la réponse utilisateur */}
      <TextInput
        style={styles.input}
        placeholder="Entrez votre réponse"
        keyboardType="numeric"
        onChangeText={setUserAnswer}
        value={userAnswer}
        editable={!gameOver}  // Désactive la zone de saisie si Game Over
      />

      {/* Bouton "Soumettre" */}
      <TouchableOpacity
        style={[styles.button, btnEnabled ? styles.buttonActive : styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!btnEnabled || gameOver}  // Désactive le bouton si le jeu est terminé
      >
        <Text style={styles.buttonText}>Soumettre</Text>
      </TouchableOpacity>

      {/* Boutons de sélection de difficulté */}
      <View style={styles.difficultyButtons}>
        <TouchableOpacity
          style={styles.difficultyButton}
          onPress={() => handleDifficultyChange('easy')}
          disabled={!canChangeDifficulty || gameOver}  // Désactive les boutons de difficulté si le jeu est terminé
        >
          <Image
            source={require('./assets/easy.png')}
            style={difficulty === 'easy' ? styles.easyActive : styles.easyInactive}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.difficultyButton}
          onPress={() => handleDifficultyChange('hard')}
          disabled={!canChangeDifficulty || gameOver}  // Désactive les boutons de difficulté si le jeu est terminé
        >
          <Image
            source={require('./assets/hard.png')}
            style={difficulty === 'hard' ? styles.hardActive : styles.hardInactive}
          />
        </TouchableOpacity>
      </View>

      {/* Boutons de sélection de l'opération */}
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

      {/* Bouton pour opération aléatoire */}
      <TouchableOpacity style={styles.randomOperationButton} onPress={randomizeOperation}>
        <Text style={styles.randomButtonText}>Opération Aléatoire</Text>
      </TouchableOpacity>

      {/* Bouton pour "Mode Mélange Extreme" */}
      <TouchableOpacity
        style={styles.randomExtremeOperationButton}
        onPress={randomizeExtremeMixedOperation} // Lorsqu'on appuie, il appelle randomizeExtremeMixedOperation
        disabled={difficulty !== 'hard'}  // Désactive ce bouton si la difficulté n'est pas "hard"
      >
        <Text style={styles.randomButtonText}>Mode Mélange Extreme (Hard)</Text>
      </TouchableOpacity>

      {/* Messages et statistiques */}
      <Text style={styles.message}>{msg}</Text>
      <Text style={styles.lives}>Vies restantes: {lives}</Text>
      <Text style={styles.score}>Score: {score}</Text>

      {/* Menu de fin de partie */}
      {gameOver && (
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  timer: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  randomOperationButton: {
    marginTop: 20,
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  randomExtremeOperationButton: {
    marginTop: 20,
    backgroundColor: '#ff9800', // Une couleur orange pour ce bouton spécifique
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  randomButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 18,
    width: '80%',
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonActive: {
    backgroundColor: '#007bff',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  message: {
    fontSize: 18,
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  lives: {
    fontSize: 18,
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  score: {
    fontSize: 18,
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  gameOverMenu: {
    marginTop: 20,
    alignItems: 'center',
  },
  gameOverButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  gameOverButtonImage: {
    width: 50,
    height: 50,
  },
  difficultyButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  difficultyButton: {
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  easyActive: {
    width: 60,
    height: 60,
  },
  easyInactive: {
    width: 60,
    height: 60,
    opacity: 0.5,
  },
  hardActive: {
    width: 60,
    height: 60,
  },
  hardInactive: {
    width: 60,
    height: 60,
    opacity: 0.5,
  },
  operationButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  operationButton: {
    fontSize: 30,
    padding: 20,
    marginHorizontal: 10,
    backgroundColor: '#007bff',
    color: '#fff',
    borderRadius: 5,
  },
});

