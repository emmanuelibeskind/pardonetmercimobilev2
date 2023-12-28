import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  useColorScheme,
  View,
  Image,

} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


const Stack = createNativeStackNavigator();


import logo from './assets/images/Pardon.png';


import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';


function App() {
  
  const [showChat, setShowChat] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [counselor, setCounselor] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [language, setLanguage] = useState('fr');
  const [page, setPage] = useState('home');
  const [currentScreen, setCurrentScreen] = useState('home');
  const goToHome = () => setCurrentScreen('home');
const goToSelectCounselor = () => setCurrentScreen('selectCounselor');



  const goToNextPage = () => {
    setPage('selectCounselor');
  }

  const handleImageClick = (selectedCounselor) => {
    setCounselor(selectedCounselor);
    setCurrentScreen('chat');
    setCurrentQuestionIndex(0);
  
    const initialMessageContent = staticQuestions[0].content.replace('[counselor]', selectedCounselor);
  
    addSystemMessage({ role: 'system', content: initialMessageContent });
  };

  
  const [radioSelection, setRadioSelection] = useState({});

const handleRadioChange = (e) => {
  setRadioSelection({ ...radioSelection, [currentQuestionIndex]: e.target.value });
};
  
  const staticQuestionsFR = [
    { role: "system", content: 'Hello, quel est ton prénom ?' },
    { role: "system", content: 'Explique moi !' },
    { 
      role: "system",
      content: "Quand cela s'est-il passé ?",
      options: ['À l\'instant', 'Aujourd’hui', 'Hier', 'Autre (précisez)'],
      isRadio: true
    },
    { 
      role: "system",
      content: "À qui t'adresses-tu ?",
      options: ['Un proche', 'Une relation professionnelle ou une connaissance', 'Un inconnu'],
      isRadio: true
    },
    { role: "system", content: "Quel est son prénom ?" },
    
    
    { 
      role: "system",
      content: 'Saisis ton adresse email ci-dessous !',
    },

    { role: "system", 
    content: 'Merci pour ta confiance. Vérifie que tu as bien reçu notre message d\'excuses dans ta boite mail !' },
  ];
  
  
  const staticQuestionsEN = [
    { role: "system", content: 'Hi there 👋🏻 What is your name?' },
    { role: "system", content: 'Explain to me!' },
    { role: "system", content: 'Can you tell me more about what happened and when it took place? What\'s the name of the person involved?' },
    { role: "system", content: 'What tone would you like for your message: serious, funny, or crazy? Should I use formal or informal language?' },
    { role: "system", content: 'How long would you like your message to be: long, medium, or short?' },
    { role: "system", content: 'Anything else you want to add? If yes, please tell us. If not, write no.' },
    { role: "system", content: 'Please provide your email address to receive the apology message 📧.' },
    { role: "system", content: 'Surprise! 🎁 Here\'s 200 euros in TEMU credits for you to spend right away: https://temu.com/u/5bgaYy50bMLaU. What do we say?' },
    { role: "system", content: 'Here we go again! To receive your message, complete: Sorry and...' }
  ];
  

  const [staticQuestions, setStaticQuestions] = useState(staticQuestionsFR); 
 
  useEffect(() => {
    setStaticQuestions(language === 'fr' ? staticQuestionsFR : staticQuestionsEN);
  }, [language]);
  

  const [loadedText, setLoadedText] = useState('');

  useEffect(() => {
    const promptDirect = "Bonjour, je voudrais générer un message d'excuses basé sur les informations suivantes :";
    setLoadedText(promptDirect);
  }, []);
  

  function nextQuestion() {
    console.log('Entering nextQuestion');
    const nextIndex = currentQuestionIndex + 1;
    console.log(nextIndex)
    console.log(staticQuestions.length)
  
    
    if (nextIndex === staticQuestions.length - 1) {
      sendRequestToChatGPT(); 
    }
  
    if (nextIndex < staticQuestions.length) {
      addSystemMessage(staticQuestions[nextIndex]);
      setCurrentQuestionIndex(nextIndex);
    }
  }
  console.log(`currentQuestionIndex: ${currentQuestionIndex}, staticQuestions.length: ${staticQuestions.length}`);

  const addSystemMessage = (text) => {
    setChatHistory((prevChatHistory) => [...prevChatHistory, { role: 'system', content: text.content }]);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const userText = chatInput.trim();
    if (userText !== '') {
      const newUserMessage = { role: 'user', content: userText };
      setChatHistory((prevChatHistory) => [...prevChatHistory, newUserMessage]);
  
      setChatInput('');
  
      if (/\S+@\S+/.test(userText)) {
        sendRequestToChatGPT();
      } else {
        nextQuestion();
      }
    }
  };
  
  
  const sendRequestToChatGPT = async () => {
    console.log('sendRequestToChatGPT is called');
    try {
      const finalInstruction = {
        role: "system",
        content: loadedText

      };
            const finalChatHistory = [...chatHistory, finalInstruction];
  
      const requestBody = {
        conversation: finalChatHistory,
        counselor: counselor,
        language: language
      };
  
      console.log('Corps de la requête :', requestBody);

      fetch('https://vps.pardonetmerci.com/generateText', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
})
.then(response => {
    console.log('Requête envoyée');
})
.catch(error => {
    console.error('Erreur de requête', error);
});

    } catch (err) {
      console.error('Error communicating with the server:', err);
      setErrorMessage('Error while trying to communicate with the server. Please try again later.');
    }
  };

  const RadioQuestion = ({ question, handleRadioChange, currentSelection }) => {
    return (
      <View style={{ flexDirection: 'column' }}>
        <Text style={{ fontWeight: 'bold' }}>{question.content}</Text>
        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleRadioChange(index)}
            style={styles.radioOption}
          >
            <View style={styles.outerCircle}>
              {currentSelection === index && <View style={styles.innerCircle} />}
            </View>
            <Text style={styles.radioText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  return (
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {page === 'home' && (
          <View style={styles.homeContainer}>
            <Image source={logo} style={styles.logo} />
            <View style={styles.flagsContainer}>
              <TouchableOpacity onPress={() => {setLanguage('fr'); goToNextPage();}}>
                <Image 
                  source={{ uri: "https://storage.googleapis.com/imagespardonetmerci/france_flag.jpg" }} 
                  style={styles.flag} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {setLanguage('en'); goToNextPage();}}>
                <Image 
                  source={{ uri: "https://storage.googleapis.com/imagespardonetmerci/uk_flag.jpg" }} 
                  style={styles.flag} 
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

{page === 'selectCounselor' && (
  <View style={styles.selectCounselorContainer}>
    <Text style={styles.counselorQuestion}>
      Qui sera ton conseiller aujourd'hui ?
    </Text>
    <View style={styles.counselorsContainer}>
      <View style={styles.counselorProfile}>
        <TouchableOpacity onPress={() => handleImageClick('Emmanuel')}>
          <Image 
            source={{ uri: "https://storage.googleapis.com/imagespardonetmerci/Emmanuel.jpg" }} 
            style={styles.counselorImage} 
          />
        </TouchableOpacity>
        <Text style={styles.counselorName}>Emmanuel</Text>
      </View>
      <View style={styles.counselorProfile}>
        <TouchableOpacity onPress={() => handleImageClick('Yasmina')}>
          <Image 
            source={{ uri: "https://storage.googleapis.com/imagespardonetmerci/Yasmina.jpg" }} 
            style={styles.counselorImage} 
          />
        </TouchableOpacity>
        <Text style={styles.counselorName}>Yas'</Text>
      </View>
    </View>
  </View>
)}

      {/* Modal de chat et Footer ici */}

      {showChat && (
  <View style={styles.chatModal}>
    <Image 
      source={{ uri: `${process.env.PUBLIC_URL}/${counselor}.jpg` }} 
      style={styles.counselorPhoto} 
    />
    <View style={styles.chatContainer}>
      {chatHistory.map((chat, i) => (
        <View key={i}>
          {chat.role === 'system' ? (
            chat.isRadio ? (
              // The RadioQuestion component will need to be implemented in React Native
              <RadioQuestion
                question={chat}
                handleRadioChange={handleRadioChange}
                currentSelection={radioSelection[currentQuestionIndex]}
              />
            ) : (
              <Text style={styles.strongText}>{chat.content}</Text>
            )
          ) : (
            <Text>{chat.content}</Text>
          )}
        </View>
      ))}
    </View>
    <View style={styles.inputButtonContainer}>
      <TextInput 
        value={chatInput} 
        onChangeText={setChatInput} 
        style={styles.enlargedTextarea} 
        multiline={true}
        onSubmitEditing={(e) => {
          if (!e.nativeEvent.shiftKey) {
            handleChatSubmit();
          }
        }}
      />
      <TouchableOpacity onPress={handleChatSubmit} style={styles.submitButton}>
        <Text>{language === 'fr' ? 'OK' : 'OK'}</Text>
      </TouchableOpacity>      
    </View>
    {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
  </View>
)}
    </ScrollView>
    
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center', // Center content vertically in ScrollView
    alignItems: 'center', // Center content horizontally
  },
  homeContainer: {
    flex: 1,
    justifyContent: 'space-around', // Space out logo and flags
    alignItems: 'center', // Center horizontally
  },
  logo: {
    width: 400, // Adjust the width as needed
    height: 400, // Adjust the height as needed
    resizeMode: 'contain',
    marginTop: 50,
  },
  flagsContainer: {
    flexDirection: 'row', // Align flags horizontally
    justifyContent: 'center', // Center flags container
    alignItems: 'center', // Align flags vertically
  },
  flag: {
    width: 120, // Increase the width
    height: 80, // Increase the height
    resizeMode: 'contain', // Keep flag aspect ratio
    margin: 5, // Add some margin between flags
    marginBottom: 300,
  },

  counselorsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // This will space out your images evenly
    alignItems: 'center',
    marginBottom: 150,
  },
  counselorImage: {
    width: 150, // Set a fixed width
    height: 150, // Set the same value for height to keep the aspect ratio
    borderRadius: 75, // This should be half of the width and height
    resizeMode: 'cover',
    margin: 10,
  },

  counselorName: {
    fontSize: 16, // Adjust the font size as needed
    marginTop: 8, // Spacing between image and text
    color: 'black', // Adjust the text color as needed
  },

  counselorProfile: {
    alignItems: 'center', // Center the image and name
  },

  counselorQuestion: {
    fontSize: 30, // Adjust the font size as needed
    fontWeight: 'bold', // If you want the text to be bold
    marginBottom: 200, // Spacing between text and images
    textAlign: 'center', // Align text to center
  },
});



export default App;