#!/usr/bin/env node
const program = require('commander')
const {version, name, description} = require('../package.json')
const updateProducts = require('./apiproduct')
const updateKvms = require('./kvms')
const targetserver = require('./targetserver')
const updateCache = require('./cache')
const deployProxy = require('./proxy')

function handleError (e) {
  console.error('ERROR:')
  console.error(e.message)
  process.exit(1)
}

const build = () => {
  return {
    hybrid: program.hybrid,
    organization: program.org,
    environment: program.env,
    username: process.env.APIGEE_USERNAME || process.env.APIGEE_USER,
    password: process.env.APIGEE_PASSWORD,
    url: program.hybrid ? 'https://apigee.googleapis.com/v1' : 'https://api.enterprise.apigee.com/v1'
  }
}

program.name(name)
  .version(version, '-v, --version')
  .description(description)
  .option('-o, --org <org>', 'apigee org')
  .option('-e, --env <env>', 'apigee env')
  .option('-h, --hybrid <accessToken>', 'specify if you wish to deploy to Apigee hybrid')

program.command('products <manifest>')
  .description('creates or updates a list of products based on the given manifest')
  .action((manifest) => updateProducts(build(), manifest).catch(handleError))

program.command('kvms <manifest>')
  .option('--purgeDeleted', 'Deletes all entries in the KVM that are not in the Manifest.', false)
  .action((manifest, command) => updateKvms(build(), manifest).catch(handleError))

program.command('targetservers <manifest>')
  .action((manifest, command) => targetserver(build(), manifest).catch(handleError))

program.command('caches <manifest>')
  .description('creates or updates a list of caches based on the given manifest')
  .action((manifest) => updateCache(build(), manifest).catch(handleError))

program.command('deploy')
  .requiredOption('-n, --api <name>', 'The name of the API proxy. Note: The name of the API proxy must be unique within an organization. The characters you are allowed to use in the name are restricted to the following: A-Z0-9._\\-$ %.')
  .option('-d, --directory <directory>', 'The path to the root directory of the API proxy on your local system. Will attempt to use current directory is none is specified.', 'apiproxy')
  .description('deploy a proxy based on a zip file')
  .action((options) => deployProxy(build(), options.name, options.directory).catch(handleError))

program.parse(process.argv)
