import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import firestore from '@react-native-firebase/firestore'
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { 
  searchProductPrompt, 
  categoryPrompt, 
  pricePrompt,
  productDetailPrompt,
  healthPrompt,
  ingredientPrompt,
  promotionPrompt,
  storeInfoPrompt,
  orderPrompt
} from '../data/chatbotPrompts';

const PROMPT_KEYWORDS = {
  PRICE: ['giá', 'bao nhiêu', 'tiền'],
  CATEGORY: ['loại', 'danh mục', 'menu'],
  HEALTH: ['sức khỏe', 'dinh dưỡng', 'dị ứng', 'tiểu đường', 'bệnh'],
  INGREDIENT: ['nguyên liệu', 'thành phần', 'làm từ'],
  PROMOTION: ['khuyến mãi', 'giảm giá', 'ưu đãi', 'mã'],
  STORE_INFO: ['địa chỉ', 'địa điểm', 'mở cửa', 'liên hệ', 'số điện thoại'],
  PRODUCT_DETAIL: ['chi tiết', 'mô tả', 'hương vị'],
  ORDER:['đặt', 'hàng', 'đơn', 'phí', 'giao hàng', 'khu vực'],
};

const getPromptType = (userInput) => {
  const input = userInput.toLowerCase();
  
  // Kiểm tra từng loại prompt dựa trên keywords
  for (const [type, keywords] of Object.entries(PROMPT_KEYWORDS)) {
    if (keywords.some(keyword => input.includes(keyword))) {
      return type;
    }
  }
  
  return 'SEARCH'; // Default prompt type
};

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

  // Tạo danh sách categories từ products
  const getUniqueCategories = () => {
    return [...new Set(products.map(product => product.category))];
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
      const promptType = getPromptType(inputText);
      const uniqueCategories = getUniqueCategories();
      
      // Object map các loại prompt
      const promptMap = {
        PRICE: pricePrompt(products, inputText),
        CATEGORY: categoryPrompt(products, uniqueCategories, inputText),
        HEALTH: healthPrompt(products, inputText),
        INGREDIENT: ingredientPrompt(products, inputText),
        PROMOTION: promotionPrompt(products, inputText),
        STORE_INFO: storeInfoPrompt(products, inputText),
        PRODUCT_DETAIL: productDetailPrompt(products, inputText),
        SEARCH: searchProductPrompt(products, inputText),
        ORDER: orderPrompt(products, inputText),
      };

      const prompt = promptMap[promptType];
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const matchedResponse = response.text();

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
    } finally {
      setIsLoading(false);
    }
  };

  // Thêm hàm xử lý new chat
  const handleNewChat = () => {
    const welcomeMessage = {
      text: "Xin chào! Tôi là trợ lý tư vấn Sugar Cake & Tea. Bạn muốn mua hay tư vấn về sản phẩm nào?",
      isUser: false
    };
    setMessages([welcomeMessage]);
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
        <TouchableOpacity 
          style={styles.newChatButton}
          onPress={handleNewChat}
        >
          <Text style={styles.newChatText}>New Chat</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
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
  newChatButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 15,
  },
  newChatText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
})