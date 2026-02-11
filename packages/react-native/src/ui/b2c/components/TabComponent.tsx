import React, { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

type TabEvent = {
  selectedSegmentIndex: number;
};

type TabComponentProps = {
  marginBottom: number;
  height: number;
  backgroundColor: string;
  fontColor: string;
  fontFamily: string;
  fontSize: number;
  values: string[];
  selectedIndex: number;
  tabColor: string;
  activeFontColor: string;
  onChange(e: TabEvent): void;
};

type TabProps = {
  value: string;
  width: number;
  fontColor: string;
  fontFamily: string;
  fontSize: number;
  activeFontColor: string;
  isSelected: boolean;
  lineHeight: number;
  onClick(): void;
};

const Tab = (props: TabProps) => {
  return (
    <TouchableWithoutFeedback onPress={props.onClick}>
      <View style={{ height: '100%', width: props.width }}>
        <Text
          style={{
            height: '100%',
            lineHeight: props.lineHeight,
            fontFamily: props.fontFamily,
            fontSize: props.fontSize,
            fontWeight: 'bold',
            color: props.isSelected ? props.activeFontColor : props.fontColor,
            textAlign: 'center',
            width: props.width,
          }}
        >
          {props.value}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

export const TabComponent = (props: TabComponentProps) => {
  const [segmentWidth, setSegmentWidth] = useState(0);
  const animation = React.useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (animation && segmentWidth) {
      Animated.timing(animation, {
        toValue: segmentWidth * (props.selectedIndex || 0),
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [animation, segmentWidth, props.selectedIndex]);
  return (
    <View
      testID="TabComponent"
      style={[
        styles.default,
        {
          marginBottom: props.marginBottom,
          height: props.height,
          backgroundColor: props.backgroundColor,
        },
      ]}
      onLayout={({
        nativeEvent: {
          layout: { width },
        },
      }) => {
        const newSegmentWidth = props.values.length ? width / props.values.length : 0;
        if (newSegmentWidth !== segmentWidth) {
          setSegmentWidth(newSegmentWidth);
        }
      }}
    >
      <View style={styles.segmentsContainer}>
        {props.values.map((value, index) => (
          <Tab
            key={`tab-${index}-${value}`}
            value={value}
            fontColor={props.fontColor}
            fontFamily={props.fontFamily}
            fontSize={props.fontSize}
            width={segmentWidth}
            lineHeight={props.height}
            activeFontColor={props.activeFontColor}
            isSelected={props.selectedIndex === index}
            onClick={() => {
              props.onChange({ selectedSegmentIndex: index });
            }}
          />
        ))}
      </View>
      {props.selectedIndex != null && segmentWidth ? (
        <Animated.View
          style={[
            styles.slider,
            {
              transform: [{ translateX: animation }],
              width: segmentWidth - 4,
              zIndex: -1,
              backgroundColor: props.tabColor,
            },
          ]}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  default: {
    overflow: 'hidden',
    position: 'relative',
    height: 32,
    backgroundColor: '#EEEEF0',
    borderRadius: 9,
  },
  darkControl: {
    backgroundColor: '#1C1C1F',
  },
  disabled: {
    opacity: 0.4,
  },
  slider: {
    position: 'absolute',
    borderRadius: 7,
    top: 2,
    bottom: 2,
    right: 2,
    left: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  segmentsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    elevation: 5,
    backgroundColor: 'transparent',
    zIndex: 99,
  },
});
