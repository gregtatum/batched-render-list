import BatchedRenderList from './BatchedRenderList';
import React from 'react';
import ReactDOM from 'react-dom';

const list = [1, 2, 3]

setInterval(() => {
  list.push(list.length + 1)
  ReactDOM.render(
    <BatchedRenderList>
      {
        list.map(number => <div key={number}>{number}</div>)
      }
    </BatchedRenderList>,
    document.getElementById('mount')
  );
}, 1000);
