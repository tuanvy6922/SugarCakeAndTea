import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import firestore from '@react-native-firebase/firestore'
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ChatBot = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [products, setProducts] = useState([])
  const flatListRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false)

  // Khởi tạo Gemini AI
  const genAI = new GoogleGenerativeAI('AIzaSyDb7e-jYQusGEJUZGF2y-X4JY4z7BpapcI')

  useEffect(() => {
    // Thay thế greeting từ chatbotData bằng greeting cố định
    const welcomeMessage = {
      text: "Xin chào! Tôi là trợ lý tư vấn Sugar Cake & Tea. Bạn muốn mua hay tư vấn về sản phẩm nào?",
      isUser: false
    };
    setMessages([welcomeMessage]);

    // Lắng nghe thay đổi từ collection Product
    const unsubscribeProducts = firestore()
      .collection('Product')
      .onSnapshot(
        snapshot => {
          const productsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setProducts(productsData)
        },
        error => {
          console.error('Error listening to products:', error)
        }
      )

    return () => {
      unsubscribeProducts()
    }
  }, [])

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  // Gửi tin nhắn và nhận phản hồi từ Gemini AI
  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = { text: inputText, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    setTimeout(scrollToBottom, 100);

    try {
      const userInputLower = inputText.toLowerCase();
      let matchedResponse = null;

      // Tìm sản phẩm liên quan từ Firebase
      const relevantProducts = products.filter(product => {
        const searchTerms = [
          product.name?.toLowerCase(),
          product.category?.toLowerCase(),
          product.description?.toLowerCase()
        ].filter(Boolean);

        return searchTerms.some(term => 
          userInputLower.includes(term) || 
          term?.includes(userInputLower)
        );
      });

      // Hiển thị giá sản phẩm
      if (relevantProducts.length > 0) {//
        const productsList = relevantProducts.map(p => {
          const prices = [];
          if (p.price?.S) prices.push(`Size S: ${p.price.S.toLocaleString()}đ`);
          if (p.price?.M) prices.push(`Size M: ${p.price.M.toLocaleString()}đ`);
          if (p.price?.L) prices.push(`Size L: ${p.price.L.toLocaleString()}đ`);
          
          const priceText = prices.length > 0 
            ? `\nGiá:\n${prices.join('\n')}`
            : '';

          return `- ${p.name}${priceText}\n  ${p.description || ''}`
        }).join('\n\n');

        matchedResponse = `Dạ, em xin tư vấn về các sản phẩm bạn quan tâm:\n${productsList}\n\nBạn muốn tìm hiểu thêm về sản phẩm nào ạ?`;
      } else {
        // Bỏ phần tìm kiếm trong chatbotData, chuyển thẳng sang sử dụng Gemini AI
        const relevantProducts = products.map(p => ({
          name: p.name,
          price: {
            S: p.price?.S,
            M: p.price?.M,
            L: p.price?.L
          },
          description: p.description || '',
          category: p.category || ''
        }));

        const prompt = `
          Bạn là trợ lý tư vấn của cửa hàng bánh trà.
          
          Thông tin tất cả sản phẩm hiện có:
          ${JSON.stringify(relevantProducts, null, 2)}
          
          Câu hỏi: ${inputText}
          
          Hãy trả lời ngắn gọn và chính xác. Nếu được hỏi về sản phẩm:
          - Cung cấp thông tin về tên, giá và mô tả
          - Nếu không tìm thấy thông tin, hãy thông báo cho người dùng
          - Luôn kết thúc bằng câu hỏi để tương tác với khách hàng
        `.trim();

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        matchedResponse = response.text();
      }

      if (!matchedResponse) {
        throw new Error('Không nhận được phản hồi');
      }

      const botMessage = { text: matchedResponse, isUser: false };
      setMessages(prev => [...prev, botMessage]);
      
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage = { 
        text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.', 
        isUser: false 
      };
      setMessages(prev => [...prev, errorMessage]);
      setTimeout(scrollToBottom, 100);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Entypo name="chevron-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tư vấn sản phẩm</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.botMessage]}>
            <Text style={[styles.messageText, { color: item.isUser ? '#FFFFFF' : '#000000' }]}>
              {item.text}
            </Text>
          </View>
        )}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
        ListFooterComponent={() => (
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadingText}>Đang soạn tin nhắn...</Text>
            </View>
          ) : null
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Nhập câu hỏi của bạn..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Entypo name="paper-plane" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ChatBot

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    maxWidth: '80%',
    borderRadius: 10,
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: props => props.isUser ? '#FFFFFF' : '#000000',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginLeft: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
  },
})