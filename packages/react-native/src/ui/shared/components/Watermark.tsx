import React from 'react';
import { View, Image } from 'react-native';

const POWERED_BY_STYTCH_IMG_URL = 'https://public-assets.stytch.com/powered_by_stytch_logo_dark.png';

export const Watermark = () => {
  return (
    <View
      testID="watermark"
      style={{
        marginTop: 16,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: '#fff',
        opacity: 0.5,
      }}
    >
      <Image source={{ uri: POWERED_BY_STYTCH_IMG_URL }} style={{ resizeMode: 'contain', width: '100%', height: 19 }} />
    </View>
  );
};
