import { Snippet } from 'codemirror';
import { CookieObject, Environment, InsomniaObject, Request as ScriptRequest, RequestInfo, Url, Variables } from 'insomnia-sdk';
import React, { FC, useRef } from 'react';

import { Settings } from '../../../models/settings';
import { translateHandlersInScript } from '../../../utils/importers/importers/postman';
import { Dropdown, DropdownButton, DropdownItem, DropdownSection, ItemContent } from '../base/dropdown';
import { CodeEditor, CodeEditorHandle } from '../codemirror/code-editor';

interface Props {
  onChange: (value: string) => void;
  defaultValue: string;
  uniquenessKey: string;
  className?: string;
  settings: Settings;
}

const getEnvVar = 'insomnia.environment.get("variable_name");';
// const getGlbVar = 'insomnia.globals.get("variable_name");';
const getVar = 'insomnia.variables.get("variable_name");';
const getCollectionVar = 'insomnia.collectionVariables.get("variable_name");';
const setEnvVar = 'insomnia.environment.set("variable_name", "variable_value");';
// const setGlbVar = 'insomnia.globals.set("variable_name", "variable_value");';
const setVar = 'insomnia.variables.set("variable_name", "variable_value");';
const setCollectionVar = 'insomnia.collectionVariables.set("variable_name", "variable_value");';
const unsetEnvVar = 'insomnia.environment.unset("variable_name");';
// const unsetGlbVar = 'insomnia.globals.unset("variable_name");';
const unsetCollectionVar = 'insomnia.collectionVariables.unset("variable_name");';
const sendReq =
  `const resp = await new Promise((resolve, reject) => {
  insomnia.sendRequest(
    'https://httpbin.org/anything',
    (err, resp) => {
      err != null ? reject(err) : resolve(resp);
    }
  );
});`;
const logValue = 'console.log("log", variableName);';
const addHeader = "insomnia.request.addHeader({key: 'X-Header-Name', value: 'header_value' });";
const removeHeader = "insomnia.request.removeHeader('X-Header-Name');";
const setMethod = "insomnia.request.method = 'GET';";
const addQueryParams = "insomnia.request.url.addQueryParams('k1=v1');";
const updateRequestBody =
  `insomnia.request.body.update({
  mode: 'raw',
  raw: 'rawContent',
});`;

const updateRequestAuth =
  `insomnia.request.auth.update(
  {
      type: 'bearer',
      bearer: [
              {key: 'token', value: 'tokenValue'},
      ],
  },
  'bearer'
);`;
const requireAModule = "const atob = require('atob');";

const getStatusCode = 'const statusCode = insomnia.response.code;';
const getStatusMsg = 'const status = insomnia.response.status;';
const getRespTime = 'const responseTime = insomnia.response.responseTime;';
const getJsonBody = 'const jsonBody = insomnia.response.json();';
const getTextBody = 'const textBody = insomnia.response.text();';
const findHeader =
  `const header = insomnia.response.headers.find(
    header => header.key === 'Content-Type',
    {},
);`;
const getCookies = 'const cookies = insomnia.response.cookies.toObject();';

const lintOptions = {
  globals: {
    // https://jshint.com/docs/options/
    insomnia: true,
    pm: true,
    require: true,
    console: true,
    _: true,
  },
  asi: true,
  // Don't require semicolons
  undef: true,
  // Prevent undefined usages
  node: true,
  esversion: 8, // ES8 syntax (async/await, etc)
};

// TODO: We probably don't want to expose every property like .toObject() so we need a way to filter those out
// or make those properties private
// TODO: introduce this functionality for other objects, such as Url, UrlMatchPattern and so on
// TODO: introduce function arguments
// TODO: provide snippets for environment keys if possible
function getRequestScriptSnippets(insomniaObject: InsomniaObject, path: string): Snippet[] {
  let snippets: Snippet[] = [];

  const refs = new Set();
  const insomniaRecords = insomniaObject as Record<string, any>;

  for (const key in insomniaObject) {
    const isPrivate = typeof key === 'string' && key.startsWith('_');
    if (isPrivate) {
      continue;
    }

    const value = insomniaRecords[key];

    if (typeof key === 'object') {
      if (refs.has(value)) {
        // avoid cyclic referring
        continue;
      } else {
        refs.add(value);
      }
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      snippets.push({
        displayValue: `${path}.${value}`,
        name: `${path}.${key}`,
        value: `${path}.${key}`,
      });
    } else if (typeof value === 'function') {
      snippets.push({
        displayValue: `${path}.${key}()`,
        name: `${path}.${key}()`,
        value: `${path}.${key}()`,
      });
    } else if (Array.isArray(value)) {
      for (const item of value) {
        snippets = snippets.concat(getRequestScriptSnippets(item, `${path}.${key}`));
      }
    } else {
      snippets = snippets.concat(getRequestScriptSnippets(value, `${path}.${key}`));
    }
  }

  return snippets;
}

export const RequestScriptEditor: FC<Props> = ({
  className,
  defaultValue,
  onChange,
  uniquenessKey,
  settings,
}) => {
  const editorRef = useRef<CodeEditorHandle>(null);

  // Inserts at the line below the cursor and moves to the line beneath
  const addSnippet = (snippet: string) => {
    const cursorRow = editorRef.current?.getCursor()?.line || 0;
    const nextRow = cursorRow + 1;
    const value = editorRef.current?.getValue() || '';

    editorRef.current?.setValue([
      ...value.split('\n').slice(0, nextRow),
      snippet,
      '\n',
      ...value.split('\n').slice(nextRow),
    ].join('\n'));

    editorRef.current?.focus();
    editorRef.current?.setCursorLine(cursorRow + snippet.split('\n').length);
  };

  // TODO(george): Add more to this object to provide improved autocomplete
  const requestScriptSnippets = getRequestScriptSnippets(
    new InsomniaObject({
      globals: new Environment('globals', {}),
      iterationData: new Environment('iterationData', {}),
      environment: new Environment('environment', {}),
      baseEnvironment: new Environment('baseEnvironment', {}),
      variables: new Variables({
        globals: new Environment('globals', {}),
        environment: new Environment('environment', {}),
        collection: new Environment('collection', {}),
        data: new Environment('data', {}),
      }),
      request: new ScriptRequest({
        url: new Url('http://placeholder.com'),
      }),
      settings,
      clientCertificates: [],
      cookies: new CookieObject({
        _id: '',
        type: '',
        parentId: '',
        modified: 0,
        created: 0,
        isPrivate: false,
        name: '',
        cookies: [],
      }),
      requestInfo: new RequestInfo({
        eventName: 'prerequest',
        iteration: 1,
        iterationCount: 1,
        requestName: '',
        requestId: '',
      }),
    },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_msg: string, _fn: () => void) => { }
    ),
    'insomnia',
  );

  return (
    <div className='h-full flex flex-col'>
      <div className="flex-1">
        <CodeEditor
          id={`script-editor-${uniquenessKey}`}
          key={uniquenessKey}
          disableContextMenu={true}
          showPrettifyButton={true}
          uniquenessKey={uniquenessKey}
          defaultValue={defaultValue}
          className={className}
          onChange={onChange}
          mode='text/javascript'
          placeholder="..."
          lintOptions={lintOptions}
          ref={editorRef}
          getAutocompleteSnippets={() => requestScriptSnippets}
          onPaste={translateHandlersInScript}
        />
      </div>
      <div className="flex flex-row border-solid border-t border-[var(--hl-md)] h-[var(--line-height-sm)] text-[var(--font-size-sm)] box-border overflow-x-auto">
        <Dropdown
          aria-label='Variable Snippets'
          placement='top left'
          triggerButton={
            <DropdownButton>
              <ItemContent
                icon="code"
                label='Variable Snippets'
              />
            </DropdownButton>
          }
        >
          <DropdownSection
            aria-label="Get values"
            title="Get values"
          >

            <DropdownItem textValue='Get an environment variable' arial-label={'Get an environment variable'}>
              <ItemContent
                icon="sliders"
                label='Get an environment variable'
                onClick={() => addSnippet(getEnvVar)}
              />
            </DropdownItem>
            {/* <DropdownItem textValue='Get a global variable' arial-label={'Get a global variable'}>
            <ItemContent
              icon="sliders"
              label='Get a global variable'
              onClick={() => addSnippet(getGlbVar)}
            />
          </DropdownItem> */}
            <DropdownItem textValue='Get a variable' arial-label={'Get a variable'}>
              <ItemContent
                icon="sliders"
                label='Get a variable'
                onClick={() => addSnippet(getVar)}
              />
            </DropdownItem>
            <DropdownItem textValue='Get a collection variable' arial-label={'Get a collection variable'}>
              <ItemContent
                icon="sliders"
                label='Get a collection variable'
                onClick={() => addSnippet(getCollectionVar)}
              />
            </DropdownItem>
          </DropdownSection>

          <DropdownSection
            aria-label="Set values"
            title="Set values"
          >
            <DropdownItem textValue='Set an environment variable' arial-label={'Set an environment variable'}>
              <ItemContent
                icon="circle-plus"
                label='Set an environment variable'
                onClick={() => addSnippet(setEnvVar)}
              />
            </DropdownItem>
            {/* <DropdownItem textValue='Set a global variable' arial-label={'Set a global variable'}>
            <ItemContent
              icon="circle-plus"
              label='Set a global variable'
              onClick={() => addSnippet(setGlbVar)}
            />
          </DropdownItem> */}
            <DropdownItem textValue='Set a variable' arial-label={'Set a variable'}>
              <ItemContent
                icon="circle-plus"
                label='Set a variable'
                onClick={() => addSnippet(setVar)}
              />
            </DropdownItem>
            <DropdownItem textValue='Set a collection variable' arial-label={'Set a collection variable'}>
              <ItemContent
                icon="circle-plus"
                label='Set a collection variable'
                onClick={() => addSnippet(setCollectionVar)}
              />
            </DropdownItem>
          </DropdownSection>

          <DropdownSection
            aria-label="Clear values"
            title="Clear values"
          >
            <DropdownItem textValue='Clear an environment variable' arial-label={'Clear an environment variable'}>
              <ItemContent
                icon="circle-minus"
                label='Clear an environment variable'
                onClick={() => addSnippet(unsetEnvVar)}
              />
            </DropdownItem>
            {/* <DropdownItem textValue='Clear a global variable' arial-label={'Clear a global variable'}>
            <ItemContent
              icon="circle-minus"
              label='Clear a global variable'
              onClick={() => addSnippet(unsetGlbVar)}
            />
          </DropdownItem> */}
            <DropdownItem textValue='Clear a collection variable' arial-label={'Clear a collection variable'}>
              <ItemContent
                icon="circle-minus"
                label='Clear a collection variable'
                onClick={() => addSnippet(unsetCollectionVar)}
              />
            </DropdownItem>
          </DropdownSection>
        </Dropdown>

        <Dropdown
          aria-label='Request Manipulation'
          placement='top left'
          triggerButton={
            <DropdownButton>
              <ItemContent
                icon="code"
                label='Request Manipulation'
              />
            </DropdownButton>
          }
        >
          <DropdownItem textValue='Add query param' arial-label={'Add query param'}>
            <ItemContent
              icon="circle-plus"
              label='Add a query param'
              onClick={() => addSnippet(addQueryParams)}
            />
          </DropdownItem>
          <DropdownItem textValue='Set method' arial-label={'Set method'}>
            <ItemContent
              icon="circle-info"
              label='Set method'
              onClick={() => addSnippet(setMethod)}
            />
          </DropdownItem>
          <DropdownItem textValue='Add a header' arial-label={'Add a header'}>
            <ItemContent
              icon="circle-plus"
              label='Add a header'
              onClick={() => addSnippet(addHeader)}
            />
          </DropdownItem>
          <DropdownItem textValue='Remove header' arial-label={'Remove header'}>
            <ItemContent
              icon="circle-minus"
              label='Remove a header'
              onClick={() => addSnippet(removeHeader)}
            />
          </DropdownItem>
          <DropdownItem textValue='Update body as raw' arial-label={'Update body as raw'}>
            <ItemContent
              icon="circle-info"
              label='Update body as raw'
              onClick={() => addSnippet(updateRequestBody)}
            />
          </DropdownItem>
          <DropdownItem textValue='Update auth method' arial-label={'Update auth method'}>
            <ItemContent
              icon="circle-user"
              label='Update auth method'
              onClick={() => addSnippet(updateRequestAuth)}
            />
          </DropdownItem>
        </Dropdown>

        <Dropdown
          aria-label='Response Handling'
          placement='top left'
          triggerButton={
            <DropdownButton>
              <ItemContent
                icon="code"
                label='Response Handling'
              />
            </DropdownButton>
          }
        >
          <DropdownItem textValue='Get status code' arial-label={'Get status code'}>
            <ItemContent
              icon="circle-info"
              label='Get status code'
              onClick={() => addSnippet(getStatusCode)}
            />
          </DropdownItem>
          <DropdownItem textValue='Get status message' arial-label={'Get status message'}>
            <ItemContent
              icon="circle-info"
              label='Get status message'
              onClick={() => addSnippet(getStatusMsg)}
            />
          </DropdownItem>
          <DropdownItem textValue='Get response time' arial-label={'Get response time'}>
            <ItemContent
              icon="circle-info"
              label='Get response time'
              onClick={() => addSnippet(getRespTime)}
            />
          </DropdownItem>
          <DropdownItem textValue='Get body as JSON' arial-label={'Get body as JSON'}>
            <ItemContent
              icon="circle-info"
              label='Get body as JSON'
              onClick={() => addSnippet(getJsonBody)}
            />
          </DropdownItem>
          <DropdownItem textValue='Get body as text' arial-label={'Get body as text'}>
            <ItemContent
              icon="circle-info"
              label='Get body as text'
              onClick={() => addSnippet(getTextBody)}
            />
          </DropdownItem>
          <DropdownItem textValue='Find a header by name' arial-label={'Find a header by name'}>
            <ItemContent
              icon="circle-info"
              label='Find a header by name'
              onClick={() => addSnippet(findHeader)}
            />
          </DropdownItem>
          <DropdownItem textValue='Get cookies' arial-label={'Get cookies'}>
            <ItemContent
              icon="circle-info"
              label='Get cookies'
              onClick={() => addSnippet(getCookies)}
            />
          </DropdownItem>
        </Dropdown>

        <Dropdown
          aria-label='Misc'
          placement='top left'
          triggerButton={
            <DropdownButton>
              <ItemContent
                icon="code"
                label='Misc'
              />
            </DropdownButton>
          }
        >
          <DropdownItem textValue='Send a request' arial-label={'Send a request'}>
            <ItemContent
              icon="circle-play"
              label='Send a request'
              onClick={() => addSnippet(sendReq)}
            />
          </DropdownItem>
          <DropdownItem textValue='Print log' arial-label={'Print log'}>
            <ItemContent
              icon="print"
              label='Print log'
              onClick={() => addSnippet(logValue)}
            />
          </DropdownItem>
          <DropdownItem textValue='Require a module' arial-label={'Require a module'}>
            <ItemContent
              icon="circle-plus"
              label='Require a module'
              onClick={() => addSnippet(requireAModule)}
            />
          </DropdownItem>
        </Dropdown>
      </div>
    </div>
  );
};
