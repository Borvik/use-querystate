import React from 'react';
import { useRenderCount } from './useRenderCount';
import { useQueryState } from '@borvik/use-querystate';
import { useTestingState } from '~/lib/testState';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const SampleCode = `import React from 'react';
import { useQueryState } from '@borvik/use-querystate';

/**
 * Naive implementation to toggle "page" between 1 and 2, while also
 * toggling "pageSize" between 15 and 50.
 * 
 * This pattern is NOT recommended, due to race conditions that may occur.
 */
const MultiHookUsage: React.FC = () => {
  const [page, setPages] = useQueryState({page: 1})
  const [pageSize, setPageSize] = useQueryState({pageSize: 15});

  return <>
    <button onClick={() => {
      setPages(prev => prev.page === 1 ? { page : 2 } : { page : 1 })
      setPageSize(prev => prev.pageSize === 15 ? { pageSize : 50} : { pageSize : 15 })
    }}>Set Page/Size</button>
    <pre>
      Current: {JSON.stringify({ page: page.page, pageSize: pageSize.pageSize })}
    </pre>
  </>
}
`;

export const MultiHookTest: React.FC = () => {
  const [running, toggle] = useTestingState('multi');

  return <article className={running ? 'running' : undefined}>
    <header className='flex place-content-between items-center'>
      <span>(Unsafe) Multi Hook Usage</span>
      <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={toggle}>{running ? 'Stop' : 'Start'}</button>
    </header>
    {running && <>
      <MultiHookUsage />
      <SyntaxHighlighter language='typescript' style={vscDarkPlus}>{SampleCode}</SyntaxHighlighter>
    </>}
  </article>
}

const MultiHookUsage: React.FC = () => {
  const renderCount = useRenderCount();
  const [page, setPages] = useQueryState({page: 1})
  const [pageSize, setPageSize] = useQueryState({pageSize: 15});

  const expected = { page: 1, pageSize: 15 };
  if (page.page == 2 || pageSize.pageSize == 50) {
    expected.page = 2;
    expected.pageSize = 50;
  }

  const isMatch = (expected.page == page.page && expected.pageSize == pageSize.pageSize);

  return <>
    <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={() => {
      setPages(prev => prev.page === 1 ? { page : 2 } : { page : 1 })
      setPageSize(prev => prev.pageSize === 15 ? { pageSize : 50} : { pageSize : 15 })
    }}>Set Page/Size</button>
    <pre>Rendered: {renderCount}</pre>
    <pre>
      Expected: {JSON.stringify(expected)}<br />
      <span className={isMatch ? 'text-green-600' : 'text-red-600'}>Current: {JSON.stringify({ page: page.page, pageSize: pageSize.pageSize })}</span>
    </pre>
    <br />
    <p className='mb-1'>This is an example of a problem that can be solved by batching the updates</p>
    <p className='mb-1'>Essentially when not batched, the query changes can't build on each other properly, often causing only the last change to be applied.</p>
    <p className='mb-1'>Also as each query change is similar to a <code>setState</code> each one causes a rerender.</p>
    <p>Batching queues all query changes until the end before applying to the query string, allowing to build on each other. It also allows for only one location change to run causing only a single rerender.</p>
  </>
}