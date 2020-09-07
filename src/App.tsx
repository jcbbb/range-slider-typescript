import React from 'react';
import RangeSlider from './RangeSlider';
import './App.scss';

function App() {
    return (
        <div className="App">
            <RangeSlider min={0} max={20} defaultMin={6} defaultMax={15} />
        </div>
    );
}

export default App;
