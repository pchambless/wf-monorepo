import React from 'react';
import createLogger from './logger';

class MinViableProd extends React.Component {
  constructor(name, props) {
    super(props);
    this.log = createLogger(name);
    this.state = this.constructor.initialState || {};
  }

  // Default error boundary
  componentDidCatch(error, errorInfo) {
    this.log.error('Component error:', { error, errorInfo });
  }

  // Basic lifecycle logging
  componentDidMount() {
    this.log.debug('Component mounted');
  }

  componentDidUpdate(_prevProps, _prevState) {
    this.log.debug('Component updated');
  }

  componentWillUnmount() {
    this.log.debug('Component will unmount');
  }
}

export default MinViableProd;
