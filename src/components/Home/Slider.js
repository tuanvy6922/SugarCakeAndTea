import { View, FlatList, Image, SafeAreaView, Dimensions } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'

export default function Slider({ sliderList }) {
  const screenWidth = Dimensions.get('window').width;
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef(null);
  const isAutoScrolling = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAutoScrolling.current && sliderList.length > 0) {
        setCurrentSlide(prevSlide => {
          const nextSlide = (prevSlide + 1) % sliderList.length;
          if (flatListRef.current && typeof nextSlide === 'number') {
            flatListRef.current.scrollToIndex({ 
              animated: true, 
              index: nextSlide,
              viewPosition: 0
            });
          }
          return nextSlide;
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [sliderList.length]);

  const handleScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    setCurrentSlide(index);
    isAutoScrolling.current = false;
  };

  const handleScrollBegin = () => {
    isAutoScrolling.current = true;
  };

  return (
    <SafeAreaView style={{ marginTop: 10}}>
      <FlatList 
        ref={flatListRef}
        data={sliderList} 
        horizontal={true} 
        pagingEnabled={true} // Ensures each item takes up the full screen width
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollBeginDrag={handleScrollBegin}
        renderItem={({item, index})=>( 
          <View style={{ width: screenWidth }}>
            <Image 
              source={{uri: item?.image}} 
              style={{ height: 200, width: screenWidth, borderRadius: 10, resizeMode: 'cover' }}
            />
          </View>
        )} 
        keyExtractor={(item, index) => index.toString()} 
        extraData={currentSlide} // Ensures FlatList re-renders when currentSlide changes
      />
    </SafeAreaView>
  )
}