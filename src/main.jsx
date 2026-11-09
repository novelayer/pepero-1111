import { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import App, { OgCard } from './App.jsx';
import './styles.css';

class Guard extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { window.__showFallback?.(); }
  render() { return this.state.failed ? null : this.props.children; }
}

const og = new URLSearchParams(location.search).get('og') === '1';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Guard>{og ? <OgCard /> : <App />}</Guard>
  </StrictMode>,
);
