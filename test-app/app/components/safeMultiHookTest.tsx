import React, { useRef } from 'react';
import { useRenderCount } from './useRenderCount';
import { batchedQSUpdate, useQueryState } from '@borvik/use-querystate';
import { useTestingState } from '~/lib/testState';

export const SafeMultiHookTest: React.FC = () => {
  const [running, toggle] = useTestingState('mulit-safe');

  return <article className={running ? 'running' : undefined}>
    <header className='flex place-content-between items-center'>
      <span className='block'>Safe Multi Hook Usage</span>
      <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={toggle}>{running ? 'Stop' : 'Start'}</button>
    </header>
    {running && <SafeMultiHookUsage />}
  </article>
}

const SafeMultiHookUsage: React.FC = () => {
  const renderCount = useRenderCount();
  const [page, setPages] = useQueryState({page: 1})
  const [pageSize, setPageSize] = useQueryState({pageSize: 15});
  const initial = useRef({ page: page.page, pageSize: pageSize.pageSize, init: true });

  const expected = { page: 1, pageSize: 15 };
  if (page.page == 2 || pageSize.pageSize == 50) {
    expected.page = 2;
    expected.pageSize = 50;
  }

  const isMatch = (expected.page == page.page && expected.pageSize == pageSize.pageSize);
  
  return <>
    <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={() => {
      batchedQSUpdate(() => {
        setPages(prev => prev.page === 1 ? { page : 2 } : { page : 1 })
        setPageSize(prev => prev.pageSize === 15 ? { pageSize : 50} : { pageSize : 15 })
      });
    }}>Set Page/Size</button>
    <pre>Rendered: {renderCount}</pre>
    <pre>
      Expected: {JSON.stringify(expected)}<br />
      <span className={isMatch ? 'text-green-600' : 'text-red-600'}>Current: {JSON.stringify({ page: page.page, pageSize: pageSize.pageSize })}</span>
    </pre>
    <br />
    <p>This is the same as the other multi-hook example, but here it batches the query modifications together in order to ensure that they properly run.</p>
  </>
}