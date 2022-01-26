import { loadEnvYaml } from '@kifly/beagle/libs/config/load-env-yaml';
import { Application } from './application';

Application.run(loadEnvYaml());
