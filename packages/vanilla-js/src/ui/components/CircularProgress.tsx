import React from 'react';
import styled, { keyframes } from 'styled-components';

const circularRotateKeyframe = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const circularDashKeyframe = keyframes`
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }
  100% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -125px;
  }
`;

type CircularProgressProps = {
  size: number;
  thickness: number;
};

const AnimatedCircle = styled.circle`
  stroke-dasharray: 80px, 200px;
  stroke-dashoffset: 0;
  animation: ${circularDashKeyframe} 1.4s ease-in-out infinite;
  stroke: ${(props) => props.theme.colors.primary};
  fill: none;
`;

const CircularProgressRoot = styled.div<{ size: number }>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  animation: ${circularRotateKeyframe} 1.4s ease-in-out infinite;
`;

const CircularProgressSVG = styled.svg`
  display: block;
`;

/**
 * A lightweight spinning circle loading animation heavily inspired by the
 * MUI CircularProgress component
 * https://github.com/mui/material-ui/blob/master/packages/mui-material/src/CircularProgress/CircularProgress.js
 */
export const CircularProgress = ({ size, thickness }: CircularProgressProps) => (
  <CircularProgressRoot size={size}>
    <CircularProgressSVG viewBox={`${size / 2} ${size / 2} ${size} ${size}`}>
      <AnimatedCircle cx={size} cy={size} r={(size - thickness) / 2} fill="none" strokeWidth={thickness} />
    </CircularProgressSVG>
  </CircularProgressRoot>
);
