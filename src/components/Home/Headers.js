import { View, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native'
import React from 'react'
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window')

export default function Header() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ backgroundColor: '#f0f0f0', paddingTop: 10 }}>
      <View style={{ 
        alignItems: 'center',
        paddingBottom: 10, 
        borderBottomWidth: 1, 
        borderBottomColor: '#ccc',
        position: 'relative'
      }}>
        <Image 
          source={require('../../../assets/title.png')} 
          style={{ width: width*0.6, height: height*0.04 }}
        />
      </View>
    </SafeAreaView>
  )
}
