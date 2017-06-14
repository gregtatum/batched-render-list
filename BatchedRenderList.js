import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';

const FRAME_BUDGET = 10; // Milliseconds

export default class BatchedRenderList extends PureComponent {

  constructor(props) {
    super(props);
    this._raf = null;
    this._toRender = [];
    this.state = {
      element: null,
      // These mutate as they are rendered and pop off.
      itemsToRender: [],
      itemsToRenderElements: [],
    };
  }

  _receiveNewChildren(oldList, newList, element) {
    const newItems = newList.filter(itemA => !oldList.some(itemB => itemA.key === itemB.key));
    const newItemIndices = newItems.map(itemA => newList.findIndex(itemB => itemA.key === itemB.key));
    const newItemElements = [];
    const oldItems = oldList.filter(itemA => !newList.some(itemB => itemA.key === itemB.key));
    const oldItemIndices = oldItems.map(itemA => oldList.findIndex(itemB => itemA.key === itemB.key));
    const oldElements = oldItemIndices.map(index => element.children[index]);

    // Unmount the old components.
    for (const oldElement of oldElements) {
      ReactDOM.unmountComponentAtNode(oldElement);
      oldElement.remove();
    }

    // Stub out child mount points
    for (const newItemIndex of newItemIndices) {
      const div = document.createElement('div');
      element.insertBefore(div, element.children[newItemIndex]);
      newItemElements.push(div);
    }

    this.setState({
      itemsToRender: newItems,
      itemsToRenderElements: newItemElements,
    });

    this._scheduleRender();
  }

  componentWillUpdate(nextProps, nextState) {
    if (!this.state.element && nextState.element) {
      this._receiveNewChildren([], nextProps.children, nextState.element)
    } else if (this.props.children !== nextProps.children) {
      this._receiveNewChildren(this.props.children, nextProps.children, nextState.element)
    }
  }

  _scheduleRender() {
    if (this._raf) {
      return;
    }
    this._raf = requestAnimationFrame(() => {
      const { itemsToRender, itemsToRenderElements } = this.state;
      const start = Date.now();
      while (Date.now() - start < FRAME_BUDGET && itemsToRender.length !== 0) {
        const item = itemsToRender.shift();
        const element = itemsToRenderElements.shift();
        ReactDOM.render(item, element);
      }
      this._raf = null;
      if (itemsToRender.length > 0) {
        this._scheduleRender();
      }
    });
  }

  render() {
    return <div className='batchedRenderList'
      ref={element => {
        this.setState({element});
      }} />;
  }
}
