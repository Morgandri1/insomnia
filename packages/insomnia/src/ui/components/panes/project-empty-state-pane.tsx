import React, { FC } from 'react';
import styled from 'styled-components';

import { Button } from '../themed-button';

const Wrapper = styled.div({
  height: '100%',
  width: '100%',
  boxSizing: 'border-box',
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  opacity: 'calc(var(--opacity-subtle) * 0.8)',
});

const Divider = styled.div({
  color: 'var(--color-font)',
  maxWidth: 500,
  width: '100%',
  margin: 'var(--padding-md) 0',
  display: 'flex',
  alignItems: 'center',
  fontSize: 'var(--text-sm)',
  '&::before': {
    content: '""',
    height: '1px',
    backgroundColor: 'var(--color-font)',
    flexGrow: '1',
    opacity: 'calc(var(--opacity-subtle) * 0.8)',
    marginRight: '1rem',
  },
  '&::after': {
    content: '""',
    height: '1px',
    backgroundColor: 'var(--color-font)',
    flexGrow: '1',
    opacity: 'calc(var(--opacity-subtle) * 0.8)',
    marginLeft: '1rem',
  },
});

const Title = styled.div({
  fontWeight: 'bold',
});

const SquareButton = styled(Button)({
  flexDirection: 'column',
  padding: 'var(--padding-xl)',
  gap: 'var(--padding-md)',
  maxWidth: 180,
  background: 'linear-gradient(120.49deg, var(--color-bg) 9.66%, var(--hl-md) 107.02%)',
});

const AlmostSquareButton = styled(Button)({
  flexDirection: 'column',
  maxWidth: 130,
  padding: '4em var(--padding-xl)',
  gap: 'var(--padding-md)',
  background: 'linear-gradient(120.49deg, var(--color-bg) 9.66%, var(--hl-md) 107.02%)',
});

interface Props {
  createRequestCollection: () => void;
  createDesignDocument: () => void;
  createMockServer: () => void;
  importFrom: () => void;
  isGitSyncEnabled: boolean;
  localResource: () => void;
}

export const EmptyStatePane: FC<Props> = ({ createRequestCollection, createDesignDocument, createMockServer, importFrom, localResource }) => {
  return (
    <Wrapper>
      <Title>This is an empty project, to get started create your first resource:</Title>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          gap: 'var(--padding-md)',
          marginTop: 'var(--padding-md)',
        }}
      >
        <SquareButton
          onClick={createRequestCollection}
        >
          <i
            className='fa fa-bars'
            style={{
              fontSize: 'var(--font-size-xl)',
            }}
          /> New Collection
        </SquareButton>
        <SquareButton
          onClick={createDesignDocument}
        >
          <i
            className='fa fa-file-o'
            style={{
              fontSize: 'var(--font-size-xl)',
            }}
          /> New Document
        </SquareButton>
        <SquareButton
          onClick={createMockServer}
        >
          <i
            className='fa fa-server'
            style={{
              fontSize: 'var(--font-size-xl)',
            }}
          /> New Mock Server
        </SquareButton>
      </div>
      <Divider
        style={{
          width: '100%',
        }}
      >
        or
      </Divider>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: '100%',
          gap: 'var(--padding-md)',
          marginTop: 'var(--padding-md)',
        }}
      >
        <AlmostSquareButton
          onClick={importFrom}
        >
          <i
            className='fa fa-file-import'
            style={{
              fontSize: 'var(--font-size-lg)',
            }}
          /> Import
        </AlmostSquareButton>
        <AlmostSquareButton
          onClick={importFrom}
        >
          <i
            className='fa fa-link'
            style={{
              fontSize: 'var(--font-size-lg)',
            }}
          /> Url
        </AlmostSquareButton>
        <AlmostSquareButton
          onClick={importFrom}
        >
          <i
            className='fa fa-clipboard'
            style={{
              fontSize: 'var(--font-size-lg)',
            }}
          /> Clipboard
        </AlmostSquareButton>
        <AlmostSquareButton
          aria-label='Clone git repository'
          onClick={localResource}
        >
          <i
            className='fa fa-code-fork'
            style={{
              fontSize: 'var(--font-size-lg)',
            }}
          /> Local Resource
        </AlmostSquareButton>
        <AlmostSquareButton
          onClick={importFrom}
        >
          <span><i className="fa-regular fa-file fa-lg" /></span> Postman
        </AlmostSquareButton>
      </div>
    </Wrapper>
  );
};
