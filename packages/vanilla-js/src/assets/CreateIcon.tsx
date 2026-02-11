import React from 'react';
import { Flex } from '../ui/components/Flex';

type Options = {
  wrapped: boolean;
};

export default (IconSvgComponent: React.FC, options: Options = { wrapped: true }): React.FC => {
  const IconComponent = () => {
    const component = <IconSvgComponent />;
    return options.wrapped ? (
      <Flex height={24} width={24}>
        {component}
      </Flex>
    ) : (
      component
    );
  };

  return IconComponent;
};
