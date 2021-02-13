import React, { useState } from 'react';
import { useRenderCount } from './useRenderCount';
import { useQueryState } from '../lib';

export const MultiHookTest: React.FC = () => {
  const [running, setRunning] = useState(false);

  return <article className={running ? 'running' : undefined}>
    <header>
      <span>(Unsafe) Multi Hook Usage</span>
      <button onClick={() => setRunning(v => !v)}>{running ? 'Stop' : 'Start'}</button>
    </header>
    {running && <MultiHookUsage />}
  </article>
}

const MultiHookUsage: React.FC = () => {
  const renderCount = useRenderCount();
  const [page, setPages] = useQueryState({page: 1})
  const [pageSize, setPageSize] = useQueryState({pageSize: 15});

  return <>
    <button onClick={() => {
      setPages(prev => prev.page === 1 ? { page : 3} : { page : 1 })
      setPageSize(prev => prev.pageSize === 15 ? { pageSize : 50} : { pageSize : 15 })
    }}>Set Page/Size</button>
    <pre>Rendered: {renderCount}</pre>
    <pre>{JSON.stringify({page, pageSize}, null, 2)}</pre>
    <p>This is an example of a problem that can be solved by batching the updates</p>
    <p>Essentially when not batched, the query changes can't build on each other properly, often causing only the last change to be applied.</p>
    <p>Also as each query change is similar to a <code>setState</code> each one causes a rerender.</p>
    <p>Batching queues all query changes until the end before applying to the query string, allowing to build on each other. It also allows for only one location change to run causing only a single rerender.</p>
  </>
}