import React, { useState } from 'react';
import { useRenderCount } from './useRenderCount';
import { useQueryState } from '@borvik/use-querystate';
import { useTestingState } from '~/lib/testState';

export const SimpleHookTest: React.FC = () => {
  const [running, toggle] = useTestingState('simple');

  return <article className={running ? 'running' : undefined}>
    <header className='flex place-content-between items-center'>
      <span>Simple Hook Usage</span>
      <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={toggle}>{running ? 'Stop' : 'Start'}</button>
    </header>
    {running && <SimpleHookUsage />}
  </article>
}

const SimpleHookUsage: React.FC = () => {
  const renderCount = useRenderCount();
  const [pages, setPages] = useQueryState({page: 1});

  return <>
    <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={() => setPages(prev => prev.page === 1 ? { page : 2} : { page : 1})}>Set Page</button>
    <pre>Rendered: {renderCount}</pre>
    <pre>{JSON.stringify(pages, null, 2)}</pre>
  </>
}