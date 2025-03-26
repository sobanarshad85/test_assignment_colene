import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet
} from "react-native";
import { useRouter } from "expo-router";

const apiKey = "AIzaSyD-e_m8ldQyzm-wwH3BMldR4tu6jkyTpMQ";

export default function HomeScreen() {
  const [text, setText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSpellCheck = async () => {


    if (!text.trim()) {
      Alert.alert("Error", "Please enter some text.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Identify incorrect spelling in the following text with misspelled words wrapped in <wrong></wrong> tags: "${text}"`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        Alert.alert("Error", "Failed to check spelling.");
        return;
      }

      const data = await response.json();

      if (
        data.candidates &&
        data.candidates.length > 0 &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts.length > 0
      ) {
        const generatedText = data.candidates[0].content.parts[0].text;
        setCorrectedText(generatedText);
      } else {
        console.warn("No generated content found in the response.");
        Alert.alert("Error", "No response from AI.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert("Error", "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spell Checker</Text>

      <TextInput
        placeholder="Enter text here..."
        style={styles.input}
        multiline
        value={text}
        onChangeText={setText}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSpellCheck}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Checking..." : "Check Spelling"}</Text>
      </TouchableOpacity>

      <ScrollView style={styles.resultContainer}>
        {correctedText ? (
          <Text style={styles.correctedText}>
            {correctedText.split(/(<wrong>|<\/wrong>)/).map((part, index) =>
              part === "<wrong>" || part === "</wrong>" ? null : (
                <Text key={index} style={correctedText.includes(`<wrong>${part}</wrong>`) ? styles.wrongText : styles.normalText}>
                  {part.replace(/<wrong>|<\/wrong>/g, "")}{" "}
                </Text>
              )
            )}
          </Text>
        ) : null}
      </ScrollView>

      <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace("/")}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F8F9FA",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 12,
    height: 150,
    backgroundColor: "#FFF",
    textAlignVertical: "top",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultContainer: {
    maxHeight: 200,
    marginBottom: 20,
  },
  correctedText: {
    fontSize: 18,
    textAlign: "left",
  },
  wrongText: {
    color: "red",
    fontWeight: "bold",
  },
  normalText: {
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#DC3545",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

