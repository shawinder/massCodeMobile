import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
// Use the legacy import to fix the first screenshot error
import * as FileSystem from 'expo-file-system/legacy';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/styles/hljs';

export default function App() {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const pickDbFile = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
        const data = JSON.parse(fileContent);
        if (data.snippets) {
          setSnippets(data.snippets.filter(s => !s.isTrashed));
        }
      }
    } catch (err) {
      alert("Error loading file: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSnippets = snippets.filter(s => {
    const query = searchQuery.toLowerCase();

    // 1. Check the snippet name
    const nameMatch = s.name?.toLowerCase().includes(query);

    // 2. Check the actual code content in every fragment
    const contentMatch = s.content?.some(fragment =>
      fragment.value?.toLowerCase().includes(query) ||
      fragment.label?.toLowerCase().includes(query)
    );

    return nameMatch || contentMatch;
  });

  const renderSnippet = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.name || "Untitled"}</Text>
      {item.content?.map((fragment, index) => (
        <View key={index} style={styles.codeContainer}>
          <Text style={styles.label}>{fragment.language || 'text'}</Text>
          <SyntaxHighlighter
            language={fragment.language?.toLowerCase() || 'javascript'}
            style={atomOneDark}
            highlighter={"hljs"}
            // THESE TWO LINES FIX THE "COMPONENT CODE" ERROR:
            CodeTag={Text}
            PreTag={View}
            customStyle={{ padding: 10 }}
          >
            {fragment.value}
          </SyntaxHighlighter>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={{ color: '#333', fontSize: 10 }}>v1.0.1</Text>
          <Text style={styles.headerTitle}>massCode Mobile</Text>
          <TextInput
            style={styles.searchBar}
            placeholder="Search snippets..."
            placeholderTextColor="#666"
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.button} onPress={pickDbFile}>
            <Text style={styles.buttonText}>{loading ? "Loading..." : "Select db.json"}</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={filteredSnippets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSnippet}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#222' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  searchBar: { backgroundColor: '#111', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#0070f3', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#111', margin: 10, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#222' },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  label: { color: '#555', fontSize: 10, marginBottom: 5, fontWeight: 'bold' },
  codeContainer: { borderRadius: 5, overflow: 'hidden', marginTop: 10 }
});