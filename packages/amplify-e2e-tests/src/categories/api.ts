import * as nexpect from 'nexpect';
import { join } from 'path';
import { updateSchema } from '../utils';
import * as fs from 'fs';

import { getCLIPath, isCI } from '../utils';
const defaultSettings = {
  projectName: 'CLIIntegTestApi',
};

function readSchemaDocument(schemaName: string): string {
  const docPath = `${__dirname}/../../schemas/${schemaName}.graphql`;
  if (fs.existsSync(docPath)) {
    return fs.readFileSync(docPath).toString();
  } else {
    throw new Error(`Could not find schema at path '${docPath}'`);
  }
}

function getSchemaPath(schemaName: string): string {
  return `${__dirname}/../../schemas/${schemaName}`;
}

export function addApiWithSchema(cwd: string, schemaFile: string, verbose: boolean = !isCI()) {
  const schemaPath = getSchemaPath(schemaFile);
  return new Promise((resolve, reject) => {
    nexpect
      .spawn(getCLIPath(), ['add', 'api'], { cwd, stripColors: true, verbose })
      .wait('Please select from one of the below mentioned services:')
      .sendline('\r')
      .wait('Provide API name:')
      .sendline('\r')
      .wait(/.*Choose the default authorization type for the API.*/)
      .sendline('\r')
      .wait(/.*Enter a description for the API key.*/)
      .sendline('\r')
      .wait(/.*After how many days from now the API key should expire.*/)
      .sendline('\r')
      .wait(/.*Do you want to configure advanced settings for the GraphQL API.*/)
      .sendline('\r')
      .wait('Do you have an annotated GraphQL schema?')
      .sendline('y')
      .wait('Provide your schema file path:')
      .sendline(schemaPath)
      // tslint:disable-next-line
      .wait(
        '"amplify publish" will build all your local backend and frontend resources (if you have hosting category added) and provision it in the cloud'
      )
      .run(function(err: Error) {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}

export function updateApiSchema(cwd: string, projectName: string, schemaName: string) {
  const testSchemaPath = getSchemaPath(schemaName);
  const schemaText = fs.readFileSync(testSchemaPath).toString();
  updateSchema(cwd, projectName, schemaText);
}

export function updateApiWithMultiAuth(cwd: string, settings: any, verbose: boolean = !isCI()) {
  return new Promise((resolve, reject) => {
    nexpect
      .spawn(getCLIPath(), ['update', 'api'], { cwd, stripColors: true, verbose })
      .wait('Please select from one of the below mentioned services:')
      .sendline('')
      .wait(/.*Choose the default authorization type for the API.*/)
      .sendline('')
      .wait(/.*Enter a description for the API key.*/)
      .sendline('description')
      .wait(/.*After how many days from now the API key should expire.*/)
      .sendline('300')
      .wait(/.*Do you want to configure advanced settings for the GraphQL API.*/)
      .sendline('\x1b[B') // Down
      .wait(/.*Choose the additional authorization types you want to configure for the API.*/)
      .sendline('a\r') // All items
      // Cognito
      .wait(/.*Do you want to use the default authentication and security configuration.*/)
      .sendline('')
      .wait('How do you want users to be able to sign in?')
      .sendline('')
      .wait('Do you want to configure advanced settings?')
      .sendline('')
      // OIDC
      .wait(/.*Enter a name for the OpenID Connect provider:.*/)
      .sendline('myoidcprovider')
      .wait(/.*Enter the OpenID Connect provider domain \(Issuer URL\).*/)
      .sendline('https://facebook.com/')
      .wait(/.*Enter the Client Id from your OpenID Client Connect application.*/)
      .sendline('clientId')
      .wait(/.*Enter the number of milliseconds a token is valid after being issued to a user.*/)
      .sendline('1000')
      .wait(/.*Enter the number of milliseconds a token is valid after being authenticated.*/)
      .sendline('2000')
      .wait(/.*Successfully updated resource.*/)
      .sendEof()
      .run(function(err: Error) {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}
