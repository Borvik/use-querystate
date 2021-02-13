import React, { useState } from 'react';
import { useRenderCount } from './useRenderCount';
import { batchedQSUpdate, useQueryState } from '../lib';

export const SafeMultiHookTest: React.FC = () => {
  const [running, setRunning] = useState(false);

  return <article className={running ? 'running' : undefined}>
    <header>
      <span>Safe Multi Hook Usage</span>
      <button onClick={() => setRunning(v => !v)}>{running ? 'Stop' : 'Start'}</button>
    </header>
    {running && <SafeMultiHookUsage />}
  </article>
}

const SafeMultiHookUsage: React.FC = () => {
  const renderCount = useRenderCount();
  const [page, setPages] = useQueryState({page: 1})
  const [pageSize, setPageSize] = useQueryState({pageSize: 15});

  return <>
    <button onClick={() => {
      batchedQSUpdate(() => {
        setPages(prev => prev.page === 1 ? { page : 2} : { page : 1 })
        setPageSize(prev => prev.pageSize === 15 ? { pageSize : 50} : { pageSize : 15 })
      });
    }}>Set Page/Size</button>
    <pre>Rendered: {renderCount}</pre>
    <pre>{JSON.stringify({page, pageSize}, null, 2)}</pre>
  </>
}