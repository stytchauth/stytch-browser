import { logger } from '@stytch/core';
import { StyleConfig } from '@stytch/core/public';

import { DeepRequired } from '../../utils';
import { styleToTheme } from './styleToTheme';

const DEFAULT_STYLE_CONFIG: Omit<DeepRequired<StyleConfig>, 'inputs'> = {
  container: {
    backgroundColor: '#FFFFFF',
    borderColor: '#ADBCC5',
    borderRadius: '8px',
    width: '400px',
  },
  colors: {
    primary: '#19303D',
    secondary: '#5C727D',
    success: '#0C5A56',
    warning: '#FFD94A',
    error: '#8B1214',
    accent: '#ECFAFF',
  },
  buttons: {
    primary: {
      backgroundColor: '#19303D',
      textColor: '#FFFFFF',
      borderColor: '#19303D',
      borderRadius: '4px',
    },
    secondary: {
      backgroundColor: '#FFFFFF',
      textColor: '#19303D',
      borderColor: '#19303D',
      borderRadius: '4px',
    },
    disabled: {
      backgroundColor: '#F3F5F6',
      textColor: '#8296A1',
      borderColor: '#F3F5F6',
      borderRadius: '4px',
    },
  },
  fontFamily: 'Arial, Helvetica, sans-serif',
  hideHeaderText: false,
  logo: {
    logoImageUrl: 'https://example.com/logo.png',
  },
};

describe(styleToTheme, () => {
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(logger, 'warn').mockImplementation();
    errorSpy = jest.spyOn(logger, 'error').mockImplementation();
  });

  afterEach(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should map style config to theme', () => {
    const mapped = styleToTheme(DEFAULT_STYLE_CONFIG);

    expect(mapped).toMatchInlineSnapshot(`
     {
       "options": {
         "hideHeaderText": false,
         "logo": {
           "alt": "",
           "url": "https://example.com/logo.png",
         },
       },
       "theme": {
         "accent": "#ECFAFF",
         "background": "#FFFFFF",
         "border": "#ADBCC5",
         "button-radius": "4px",
         "container-width": "400px",
         "destructive": "#8B1214",
         "font-family": "Arial, Helvetica, sans-serif",
         "primary": "#19303D",
         "primary-foreground": "#FFFFFF",
         "rounded-base": "calc(8px * 0.25)",
         "secondary": "#FFFFFF",
         "secondary-foreground": "#19303D",
         "success": "#0C5A56",
         "warning": "#FFD94A",
       },
     }
    `);

    expect(warnSpy.mock.calls).toMatchInlineSnapshot(`
     [
       [
         "styleToTheme: We recommend setting theme['color-scheme'] to either 'light' or 'dark' explicitly depending on whether this is a light or dark theme. This enables icons to automatically automatically apply contrasting colors.",
       ],
       [
         "styleToTheme: buttons.disabled is no longer supported",
         {
           "disabled": {
             "backgroundColor": "#F3F5F6",
             "borderColor": "#F3F5F6",
             "borderRadius": "4px",
             "textColor": "#8296A1",
           },
         },
       ],
       [
         "styleToTheme: Please set options.logo.alt for the logo alt text for accessibility",
       ],
     ]
    `);
    expect(errorSpy.mock.calls).toMatchInlineSnapshot(`[]`);
  });

  describe('logger warnings', () => {
    it('should warn about color-scheme recommendation', () => {
      styleToTheme({});

      expect(warnSpy.mock.calls[0]).toMatchInlineSnapshot(`
       [
         "styleToTheme: We recommend setting theme['color-scheme'] to either 'light' or 'dark' explicitly depending on whether this is a light or dark theme. This enables icons to automatically automatically apply contrasting colors.",
       ]
      `);
    });

    it('should warn about unrecognized outer properties', () => {
      const config = {
        unknownProperty: 'value',
      } as StyleConfig;

      styleToTheme(config);

      expect(warnSpy.mock.calls.slice(1)).toMatchInlineSnapshot(`
       [
         [
           "styleToTheme: Unrecognized style properties",
           {
             "unknownProperty": "value",
           },
         ],
       ]
      `);
    });

    it('should warn about unrecognized colors properties', () => {
      const config = {
        colors: {
          primary: '#19303D',
          unknownColor: '#123456',
        },
      } as StyleConfig;

      styleToTheme(config);

      expect(warnSpy.mock.calls.slice(1)).toMatchInlineSnapshot(`
       [
         [
           "styleToTheme: Unrecognized style.colors properties",
           {
             "unknownColor": "#123456",
           },
         ],
       ]
      `);
    });

    it('should warn about unrecognized container properties', () => {
      const config = {
        container: {
          backgroundColor: '#FFFFFF',
          unknownContainerProp: 'value',
        },
      } as StyleConfig;

      styleToTheme(config);

      expect(warnSpy.mock.calls.slice(1)).toMatchInlineSnapshot(`
       [
         [
           "styleToTheme: Unrecognized style.container properties",
           {
             "unknownContainerProp": "value",
           },
         ],
       ]
      `);
    });

    it('should warn about unrecognized buttons properties', () => {
      const config = {
        buttons: {
          unknownButtonProp: 'value',
        },
      } as StyleConfig;

      styleToTheme(config);

      expect(warnSpy.mock.calls.slice(1)).toMatchInlineSnapshot(`
       [
         [
           "styleToTheme: Unrecognized style.buttons properties",
           {
             "unknownButtonProp": "value",
           },
         ],
       ]
      `);
    });

    it('should warn about disabled buttons no longer being supported', () => {
      const config = {
        buttons: {
          disabled: {
            backgroundColor: '#F3F5F6',
            textColor: '#8296A1',
            borderColor: '#F3F5F6',
            borderRadius: '4px',
          },
        },
      } as StyleConfig;

      styleToTheme(config);

      expect(warnSpy.mock.calls.slice(1)).toMatchInlineSnapshot(`
       [
         [
           "styleToTheme: buttons.disabled is no longer supported",
           {
             "disabled": {
               "backgroundColor": "#F3F5F6",
               "borderColor": "#F3F5F6",
               "borderRadius": "4px",
               "textColor": "#8296A1",
             },
           },
         ],
       ]
      `);
    });

    it('should warn about missing logo alt text', () => {
      const config = {
        logo: {
          logoImageUrl: 'https://example.com/logo.png',
        },
      };

      styleToTheme(config);

      expect(warnSpy.mock.calls.slice(1)).toMatchInlineSnapshot(`
       [
         [
           "styleToTheme: Please set options.logo.alt for the logo alt text for accessibility",
         ],
       ]
      `);
    });

    it('should warn about unrecognized inputs properties', () => {
      const config = {
        inputs: {
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
          unknownInputProp: 'value',
        },
      } as StyleConfig;

      styleToTheme(config);

      expect(warnSpy.mock.calls.slice(1)).toMatchInlineSnapshot(`
       [
         [
           "styleToTheme: Unrecognized style.buttons properties",
           {
             "unknownInputProp": "value",
           },
         ],
       ]
      `);
    });
  });

  describe('logger errors', () => {
    it('should error when primary button border color differs from background color', () => {
      const config = {
        buttons: {
          primary: {
            backgroundColor: '#19303D',
            textColor: '#FFFFFF',
            borderColor: '#FF0000', // Different from backgroundColor
          },
        },
      };

      styleToTheme(config);

      expect(errorSpy.mock.calls).toMatchInlineSnapshot(`
       [
         [
           "styleToTheme: primary button's border color is now always equal to background color; having distinct colors is no longer supported",
           {
             "backgroundColor": "#19303D",
             "borderColor": "#FF0000",
           },
         ],
       ]
      `);
    });

    it('should error when secondary button border color differs from text color', () => {
      const config = {
        buttons: {
          secondary: {
            backgroundColor: '#FFFFFF',
            textColor: '#19303D',
            borderColor: '#FF0000', // Different from textColor
          },
        },
      };

      styleToTheme(config);

      expect(errorSpy.mock.calls).toMatchInlineSnapshot(`
       [
         [
           "styleToTheme: secondary button's border color is now always equal to text color",
           {
             "borderColor": "#FF0000",
             "textColor": "#19303D",
           },
         ],
       ]
      `);
    });

    it('should error when primary and secondary button border radius differ', () => {
      const config = {
        buttons: {
          primary: {
            backgroundColor: '#19303D',
            textColor: '#FFFFFF',
            borderColor: '#19303D',
            borderRadius: '4px',
          },
          secondary: {
            backgroundColor: '#FFFFFF',
            textColor: '#19303D',
            borderColor: '#19303D',
            borderRadius: '8px', // Different from primary
          },
        },
      };

      styleToTheme(config);

      expect(errorSpy.mock.calls).toMatchInlineSnapshot(`
       [
         [
           "styleToTheme: All buttons must use the same border-radius",
           {
             "primaryRadius": "4px",
             "secondaryRadius": "8px",
           },
         ],
       ]
      `);
    });

    it('should error when input background differs from container background', () => {
      const config = {
        container: {
          backgroundColor: '#FFFFFF',
        },
        inputs: {
          backgroundColor: '#FF0000', // Different from container background
          textColor: '#000000',
          borderColor: '#CCCCCC',
        },
      };

      styleToTheme(config);

      expect(errorSpy.mock.calls).toMatchInlineSnapshot(`
       [
         [
           "styleToTheme: Input now always use the container background",
           {
             "containerBackground": "#FFFFFF",
             "inputBackground": "#FF0000",
           },
         ],
       ]
      `);
    });
  });

  describe('edge cases', () => {
    it('should not warn or error for minimal valid config', () => {
      styleToTheme({});

      // Should still have the color-scheme warning
      expect(warnSpy.mock.calls).toMatchInlineSnapshot(`
       [
         [
           "styleToTheme: We recommend setting theme['color-scheme'] to either 'light' or 'dark' explicitly depending on whether this is a light or dark theme. This enables icons to automatically automatically apply contrasting colors.",
         ],
       ]
      `);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should not error when primary button border color matches background color', () => {
      const config = {
        buttons: {
          primary: {
            backgroundColor: '#19303D',
            textColor: '#FFFFFF',
            borderColor: '#19303D', // Same as backgroundColor
            borderRadius: '4px',
          },
          secondary: {
            backgroundColor: '#FFFFFF',
            textColor: '#19303D',
            borderColor: '#19303D',
            borderRadius: '4px',
          },
        },
      };

      styleToTheme(config);

      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should not error when secondary button border color matches text color', () => {
      const config = {
        buttons: {
          primary: {
            backgroundColor: '#19303D',
            textColor: '#FFFFFF',
            borderColor: '#19303D',
            borderRadius: '4px',
          },
          secondary: {
            backgroundColor: '#FFFFFF',
            textColor: '#19303D',
            borderColor: '#19303D', // Same as textColor
            borderRadius: '4px',
          },
        },
      };

      styleToTheme(config);

      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should not error when button border radii are the same', () => {
      const config = {
        buttons: {
          primary: {
            backgroundColor: '#19303D',
            textColor: '#FFFFFF',
            borderColor: '#19303D',
            borderRadius: '4px',
          },
          secondary: {
            backgroundColor: '#FFFFFF',
            textColor: '#19303D',
            borderColor: '#19303D',
            borderRadius: '4px', // Same as primary
          },
        },
      };

      styleToTheme(config);

      expect(errorSpy).not.toHaveBeenCalled();
    });
  });
});
