import React, { useState } from 'react';
import { useRenderCount } from './useRenderCount';
import { useQueryState } from '../lib';

export const SimpleHookTest: React.FC = () => {
  const [running, setRunning] = useState(false);

  return <article className={running ? 'running' : undefined}>
    <header>
      <span>Simple Hook Usage</span>
      <button onClick={() => setRunning(v => !v)}>{running ? 'Stop' : 'Start'}</button>
    </header>
    {running && <SimpleHookUsage />}
  </article>
}

const SimpleHookUsage: React.FC = () => {
  const renderCount = useRenderCount();
  /// const [pages, setPages] = useQueryState({page: 1}, { prefix: 'd.'});
  const [filter, setFilter] = useQueryState({
    filter: {
      num: "002",
    }
  }, {
    types: {
      filter: {
        num: 'string',
      }
    },
    filterToTypeDef: true,
  })

  return <>
    {/* <button onClick={() => setPages(prev => prev.page === 1 ? { page : 2} : { page : 1})}>Set Page</button> */}
    <button onClick={() => setFilter(prev => prev.filter?.num ? { filter: null } : { filter: { num: "002" } })}>Set Page</button>
    <pre>Rendered: {renderCount}</pre>
    {/* <pre>{JSON.stringify(pages, null, 2)}</pre> */}
    <pre>{JSON.stringify(filter, null, 2)}</pre>
  </>
}