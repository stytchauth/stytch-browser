import { unstable_ClassNameGenerator as ClassNameGenerator } from '@mui/material/className';
import { classNamePrefix } from './classNameSeed';

ClassNameGenerator.configure((componentName) => `${classNamePrefix}${componentName}`);
