import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getAggregatedHeartbeats } from './http-heartbeat-aggregated.reducer';

const timeRanges = [
  { label: '5 min', value: '5min' },
  { label: '15 min', value: '15min' },
  { label: '30 min', value: '30min' },
  { label: '45 min', value: '45min' },
  { label: '1 hour', value: '1hour' },
  { label: '4 hours', value: '4hour' },
  { label: '24 hours', value: '24hour' },
];

const HttpHeartbeatAggregated = () => {
  const [range, setRange] = useState('5min');
  const dispatch = useAppDispatch();
  const data = useAppSelector(state => state.apiHeartbeatAggregated.data);

  useEffect(() => {
    dispatch(getAggregatedHeartbeats(range));
  }, [range, dispatch]);

  return (
    <div>
      <h2>Monitor Aggregated Status</h2>
      <select value={range} onChange={e => setRange(e.target.value)}>
        {timeRanges.map(r => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <table>
        <thead>
          <tr>
            <th>Monitor Name</th>
            <th>Agents (Active/Inactive)</th>
            <th>URL</th>
            <th>Method</th>
            <th>Type</th>
            <th>Last Check</th>
            <th>Last Check Response Time</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.monitorId}>
              <td>{row.monitorName}</td>
              <td>
                {row.activeAgentsCount} / {row.inactiveAgentsCount}
              </td>
              <td>{row.url}</td>
              <td>{row.method}</td>
              <td>{row.type}</td>
              <td>{row.lastCheck}</td>
              <td>{row.lastCheckResponseTime}</td>
              <td>
                <a href={`/http-monitor/${row.monitorId}`}>Details</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HttpHeartbeatAggregated;
