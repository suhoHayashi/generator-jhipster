const crypto = require('crypto');
const path = require('path');
const os = require('os');
const assert = require('yeoman-assert');
const fse = require('fs-extra');
const fs = require('fs');
const { createHelpers } = require('yeoman-test');

const EnvironmentBuilder = require('../../cli/environment-builder.cjs');
const constants = require('../../generators/generator-constants.cjs');

const DOCKER_DIR = constants.DOCKER_DIR;
const FAKE_BLUEPRINT_DIR = path.join(__dirname, '../templates/fake-blueprint');

const DEFAULT_TEST_SETTINGS = { forwardCwd: true };
const DEFAULT_TEST_OPTIONS = { skipInstall: true };
const DEFAULT_TEST_ENV_OPTIONS = { skipInstall: true, dryRun: false };

module.exports = {
  DEFAULT_TEST_OPTIONS,
  basicHelpers: createTestHelpers({ generatorOptions: { reproducible: true, skipChecks: true } }),
  defaultHelpers: createTestHelpers({
    generatorOptions: { skipPrettier: true, reproducible: true, skipChecks: true },
    environmentOptions: { dryRun: true },
  }),
  skipPrettierHelpers: createTestHelpers({ generatorOptions: { skipPrettier: true, reproducible: true, skipChecks: true } }),
  dryRunHelpers: createTestHelpers({
    generatorOptions: { skipPrettier: true, reproducible: true, skipChecks: true },
    environmentOptions: { dryRun: true },
  }),
  createTestHelpers,
  shouldBeV3DockerfileCompatible,
  getJHipsterCli,
  prepareTempDir,
  testInTempDir,
  revertTempDir,
  copyTemplateBlueprints,
  copyBlueprint,
  copyFakeBlueprint,
  lnYeoman,
};

function createTestHelpers(options = {}) {
  const { environmentOptions = {} } = options;
  const sharedOptions = {
    ...DEFAULT_TEST_OPTIONS,
    ...environmentOptions.sharedOptions,
  };
  const newOptions = {
    settings: { ...DEFAULT_TEST_SETTINGS, ...options.settings },
    environmentOptions: { ...DEFAULT_TEST_ENV_OPTIONS, ...environmentOptions, sharedOptions },
    generatorOptions: { ...DEFAULT_TEST_OPTIONS, ...options.generatorOptions },
    createEnv: (...args) => EnvironmentBuilder.createEnv(...args),
  };
  return createHelpers(newOptions);
}

function shouldBeV3DockerfileCompatible(databaseType) {
  it('creates compose file without container_name, external_links, links', () => {
    assert.noFileContent(`${DOCKER_DIR}app.yml`, /container_name:/);
    assert.noFileContent(`${DOCKER_DIR}app.yml`, /external_links:/);
    assert.noFileContent(`${DOCKER_DIR}app.yml`, /links:/);
    assert.noFileContent(`${DOCKER_DIR + databaseType}.yml`, /container_name:/);
    assert.noFileContent(`${DOCKER_DIR + databaseType}.yml`, /external_links:/);
    assert.noFileContent(`${DOCKER_DIR + databaseType}.yml`, /links:/);
  });
}

function getJHipsterCli() {
  const cmdPath = path.join(__dirname, '../../dist/cli/jhipster.mjs');
  let cmd = `node ${cmdPath} `;
  if (os.platform() === 'win32') {
    // corrected test for windows user
    cmd = cmd.replace(/\\/g, '/');
  }
  return cmd;
}

function _prepareTempEnv() {
  const cwd = process.cwd();
  const tempDir = path.join(os.tmpdir(), crypto.randomBytes(20).toString('hex'));
  process.chdir(os.tmpdir());
  if (fs.existsSync(tempDir)) {
    fs.rmdirSync(tempDir, { recursive: true });
  }
  fs.mkdirSync(tempDir, { recursive: true });
  process.chdir(tempDir);
  return { cwd, tempDir: process.cwd() };
}

/**
 * Creates a temporary dir.
 * @return {function} callback to cleanup the test dir.
 */
function prepareTempDir() {
  const testEnv = _prepareTempEnv();
  return () => {
    revertTempDir(testEnv.cwd, testEnv.tempDir);
  };
}

function testInTempDir(cb) {
  const preparedEnv = _prepareTempEnv();
  const cwd = preparedEnv.cwd;
  const cbReturn = cb(preparedEnv.tempDir);
  if (cbReturn instanceof Promise) {
    return cbReturn.then(() => {
      return cwd;
    });
  }
  return cwd;
}

function revertTempDir(dest = path.join(__dirname, '..', '..'), tempDir) {
  if (tempDir === undefined) {
    const cwd = process.cwd();
    if (cwd.includes(os.tmpdir())) {
      tempDir = cwd;
    }
  }
  if (tempDir && dest !== tempDir) {
    fs.rmdirSync(tempDir, { recursive: true });
  }
  process.chdir(dest);
}

function copyTemplateBlueprints(destDir, ...blueprintNames) {
  blueprintNames.forEach(blueprintName =>
    copyBlueprint(path.join(__dirname, `../templates/blueprints/generator-jhipster-${blueprintName}`), destDir, blueprintName)
  );
}

function copyBlueprint(sourceDir, destDir, ...blueprintNames) {
  const nodeModulesPath = `${destDir}/node_modules`;
  fse.ensureDirSync(nodeModulesPath);
  blueprintNames.forEach(blueprintName => {
    fse.copySync(sourceDir, `${nodeModulesPath}/generator-jhipster-${blueprintName}`);
  });
}

function copyFakeBlueprint(destDir, ...blueprintName) {
  copyBlueprint(FAKE_BLUEPRINT_DIR, destDir, ...blueprintName);
}

function lnYeoman(packagePath) {
  const nodeModulesPath = `${packagePath}/node_modules`;
  fse.ensureDirSync(nodeModulesPath);
  fs.symlinkSync(path.join(__dirname, '../../node_modules/yeoman-generator/'), `${nodeModulesPath}/yeoman-generator`);
  fs.symlinkSync(path.join(__dirname, '../../node_modules/yeoman-environment/'), `${nodeModulesPath}/yeoman-environment`);
}
