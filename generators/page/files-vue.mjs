/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import constants from '../generator-constants.cjs';
import utils from '../utils.cjs';

/* Constants use throughout */
const CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;
const VUE_DIR = 'src/main/webapp/app/';

export const vueFiles = {
  client: [
    {
      path: VUE_DIR,
      templates: [
        {
          override: generator => generator.recreate,
          file: 'pages/page.vue',
          renameTo: generator => `pages/${generator.pageFolderName}/${generator.pageFilename}.vue`,
        },
        {
          override: generator => generator.recreate,
          file: 'pages/page.service.ts',
          renameTo: generator => `pages/${generator.pageFolderName}/${generator.pageFilename}.service.ts`,
        },
        {
          override: generator => generator.recreate,
          file: 'pages/page.component.ts',
          renameTo: generator => `pages/${generator.pageFolderName}/${generator.pageFilename}.component.ts`,
        },
      ],
    },
  ],
  test: [
    {
      path: CLIENT_TEST_SRC_DIR,
      templates: [
        {
          override: generator => generator.recreate,
          file: 'spec/app/pages/page.component.spec.ts',
          renameTo: generator => `spec/app/pages/${generator.pageFolderName}/${generator.pageFilename}.component.spec.ts`,
        },
        {
          override: generator => generator.recreate,
          file: 'spec/app/pages/page.service.spec.ts',
          renameTo: generator => `spec/app/pages/${generator.pageFolderName}/${generator.pageFilename}.service.spec.ts`,
        },
      ],
    },
  ],
};

export function customizeFiles(data) {
  // Add page paths to routing system
  utils.vueAddPageToRouterImport(this, data);
  utils.vueAddPageToRouter(this, data);
  // Add page services to main
  utils.vueAddPageServiceToMainImport(this, data);
  utils.vueAddPageServiceToMain(this, data);
}
