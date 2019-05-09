import React from 'react';

import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';

import {decorate, getTabProps} from '../utils/plugins';

import Tab_ from './tab';

const Tab = decorate(Tab_, 'Tab');
const isMac = /Mac/.test(navigator.userAgent);

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export default class Tabs extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      tabs: props.tabs
    };

    this.onDragEnd = this.onDragEnd.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.tabs !== prevProps.tabs) {
      this.setState({
        tabs: this.props.tabs
      });
    }
  }

  onDragEnd(result) {
    if (!result.destination) {
      return;
    }

    const tabs = reorder(this.state.tabs, result.source.index, result.destination.index);

    this.setState({
      tabs
    });
  }

  render() {
    const tabs = this.state.tabs;
    const hide = !isMac && tabs.length === 1;

    const getItemStyle = (isDragging, draggableStyle) => {
      return Object.assign({}, draggableStyle, {
        userSelect: 'none',
        background: isDragging ? 'lightgreen' : 'grey',
        maxWidth: 250
      });
    };

    return (
      <nav className={`tabs_nav ${hide ? 'tabs_hiddenNav' : ''}`}>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId="droppable" direction="horizontal">
            {droppableProvided => (
              <div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
                {this.props.customChildrenBefore}

                <ul key="list" className="tabs_list">
                  {tabs.map((tab, i) => {
                    const {uid, title, isActive, hasActivity} = tab;
                    const props = getTabProps(tab, this.props, {
                      text: title === '' ? 'Shell' : title,
                      isFirst: i === 0,
                      isLast: tabs.length - 1 === i,
                      borderColor: this.props.borderColor,
                      isActive,
                      hasActivity,
                      onSelect: this.props.onChange.bind(null, uid),
                      onClose: this.props.onClose.bind(null, uid)
                    });

                    return (
                      <Draggable key={uid} draggableId={uid} index={i}>
                        {(draggableProvided, snapshot) => (
                          <Tab
                            innerRef={draggableProvided.innerRef}
                            draggableProps={draggableProvided.draggableProps}
                            dragHandleProps={draggableProvided.dragHandleProps}
                            key={`tab-${uid}`}
                            style={getItemStyle(snapshot.isDragging, draggableProvided.draggableProps.style)}
                            {...props}
                          />
                        )}
                      </Draggable>
                    );
                  })}
                  {droppableProvided.placeholder}
                </ul>

                {this.props.customChildren}
              </div>
            )}
          </Droppable>

          <style jsx>{`
            .tabs_nav {
              font-size: 12px;
              height: 34px;
              line-height: 34px;
              vertical-align: middle;
              color: #9b9b9b;
              cursor: default;
              position: relative;
              -webkit-user-select: none;
              -webkit-app-region: ${isMac ? 'drag' : ''};
              top: ${isMac ? '0px' : '34px'};
            }

            .tabs_hiddenNav {
              display: none;
            }

            .tabs_title {
              text-align: center;
              color: #fff;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              padding-left: 76px;
              padding-right: 76px;
            }

            .tabs_list {
              max-height: 34px;
              display: flex;
              flex-flow: row;
              margin-left: ${isMac && !this.props.maximized ? '76px' : '0'};
            }

            .tabs_borderShim {
              position: absolute;
              width: 76px;
              bottom: 0;
              border-color: #ccc;
              border-bottom-style: solid;
              border-bottom-width: 1px;
            }
          `}</style>
        </DragDropContext>
      </nav>
    );
  }
}
